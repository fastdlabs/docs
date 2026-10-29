# 已知问题

本页记录编写 8.3 文档时，从当前源码和 tag 直接确认的问题与行为差异。它不是完整的 issue 列表，也不代表修复计划；修复状态以各仓库源码、tag 和 GitHub issue 为准。

遇到问题先对照本页，再查[FAQ](faq.md)与[升级指南](upgrading.md)。如果问题不在本页，按复现步骤到对应仓库提 issue。

## 速览

| # | 问题 | 影响 | 类型 |
|---|---|---|---|
| 1 | `abort()` 依赖源码中未提供的 `HttpException` | 高 | 实现缺陷 |
| 2 | 路由 405 未单独处理 | 中 | 行为缺失 |
| 3 | Redis Session 在 Swoole 多 Worker 下的连接建立时机 | 高 | 进程模型风险 |
| 4 | Demo CORS 与正式应用差异 | 中 | 示例配置风险 |
| 5 | 旧版 ORM / 迁移 / 认证扩展不属于 8.3 核心 | 中 | 文档边界 |
| 6 | `MessageListener` / `ReceiveListener` 与事件分发不匹配 | 中 | API 缺陷 |
| 7 | HTTP 客户端默认关闭 SSL 校验 | 中 | 安全默认值 |

## 1. `abort()` 依赖未提供的 `HttpException`

**现象**

在 Controller 中调用：

```php
abort('forbidden', 403);
```

会得到 `Error: Class "HttpException" not found`，而不是 403 响应。CGI 下最终返回 JSON 500；Swoole 下由 `RequestListener::onException()` 返回带 `file`、`line`、`trace` 的 JSON 500。

**原因**

`fastD/helpers.php` 的实现是：

```php
function abort(string $message, int $statusCode = StatusCode::HTTP_BAD_REQUEST): void
{
    throw new HttpException((empty($message) ? StatusCode::PHRASES[$statusCode] : $message), $statusCode);
}
```

文件没有 `use` 任何 `HttpException`；`FastD\Http\Exception` 下只有 `ClientException`、`NetworkException`、`RequestException`，也没有全局 `HttpException` 类。异常被捕获后不会读取异常的 `code`：CGI 由 `CgiServer::abort()` 输出 JSON 500，Swoole 请求由 `RequestListener::onException()` 输出 JSON 500。

**绕过方式**

需要状态码时直接返回响应：

```php
return json(['error' => 'forbidden'], 403);
```

需要统一异常处理时，自定义异常并由全局中间件映射：

```php
<?php

declare(strict_types=1);

namespace App\Http\Exception;

use RuntimeException;

final class HttpError extends RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message, $status);
    }
}
```

```php
final class HttpErrorMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        try {
            return $handler->handle($request);
        } catch (\App\Http\Exception\HttpError $e) {
            return json(['error' => $e->getMessage()], $e->status);
        }
    }
}
```

在 ServiceProvider 中挂到全局中间件栈：

```php
$container->get('matcher')->push(new HttpErrorMiddleware());
```

**影响范围**

- [请求与响应](../guide/request-response.md)的辅助函数表仍列出 `abort()`，但当前版本不可用。
- [Redis Session](../cookbook/redis-session.md) 的示例里也使用了 `abort()`，照抄会变成 500。
- 即使补上 `HttpException` 类，默认 Runtime 仍然输出 500；要得到正确状态码，必须自己做异常到响应的映射。

## 2. 路由 405 未单独处理

**现象**

路径存在、但 HTTP 方法未注册时，框架不会返回 405，也不会带 `Allow` 头。例如只注册了 `GET /api/orders`，用 `POST /api/orders` 请求：

- `RouteMatcher` 抛 `RouteNotFoundException`（构造时 `code` 为 404）；
- 没有“方法不允许”的分支；
- 未捕获时默认 Runtime 输出 500，而不是 404 / 405。

**原因**

`routing/src/RouteMatcher.php` 的 `match()` 只查当前 method 的静态路由和变量路由，再查 `'*'` 兜底路由，最后统一抛 `RouteNotFoundException($method, $path)`。它不会反查该路径在其它 method 下是否存在，因此无法区分“路径不存在”和“方法不允许”。

**绕过方式**

1. 为路径显式注册需要支持的所有方法，包括 `OPTIONS`：

```php
return [
    ['GET', '/api/orders', \App\Http\Controller\OrderController::class],
    ['POST', '/api/orders', \App\Http\Controller\CreateOrderController::class],
    ['OPTIONS', '/api/orders', \App\Http\Controller\OrderOptionsController::class],
];
```

2. 在路径上注册 `'*'` 兜底路由，自行返回 405 与 `Allow`：

```php
return [
    ['GET', '/api/orders', \App\Http\Controller\OrderController::class],
    ['*', '/api/orders', \App\Http\Controller\MethodNotAllowedController::class],
];
```

```php
final class MethodNotAllowedController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return text('', 405)->withHeader('Allow', 'GET, OPTIONS');
    }
}
```

`'*'` 只会在这条路径没有匹配到具体 method 时生效；路径完全不存在时仍然是 `RouteNotFoundException`。方法清单需要自己维护，框架不会自动推导。

3. 在 Nginx / API 网关上统一处理方法不允许。

如果应用需要稳定的 404 / 405 语义，建议注册一个全局异常中间件，把 `RouteNotFoundException` 映射为 404，再对已知路径补 `'*'` 路由返回 405。

## 3. Redis Session 在 Swoole 多 Worker 下的连接建立时机

**现象**

`worker_num > 1` 时，偶发 Session 数据串号、Redis 协议错误或连接状态异常；请求量越大越容易复现，单 Worker 或低并发时很难发现。

**原因**

`php bin/server start` 的顺序是：

```text
SwServer::bootstrap()
  → Application::bootstrap()
  → SessionServiceProvider::register()
  → createRedisHandler()
  → new \Redis() + connect() + auth() + select()
  → Server::start()
  → fork Worker
```

Redis 连接在 **Worker fork 之前**、由主进程建立。多个 Worker 继承同一个 phpredis 连接和底层 socket；phpredis 并不是为跨进程共享连接设计的，并发命令可能互相读到对方的响应。

**绕过方式**

- 最直接：Redis Session 场景先用 `worker_num => 1`，或把 Session 放到外部共享存储并确保每进程独立连接。
- 需要在多 Worker 使用 Redis 时，在 Worker 启动阶段为每个 Worker 重新建立连接，并重建使用该连接的 `SessionMiddleware`；只替换容器里的 `session.handler` 不会自动更新已经构造好的中间件。
- 单机场景可以改用 Swoole Table Session（`handler => 'swoole_table'`），避免网络连接共享。
- Redis 不可用时 Provider 会抛 `InvalidArgumentException` 导致启动失败，不会自动降级到文件 Session；部署时要保证 Redis 先于应用就绪。

配置与验证见 [Redis Session](../cookbook/redis-session.md)。

## 4. Demo CORS 与正式应用差异

**现象**

`fastd/dobee-demo` 的跨域配置可以直接跑通演示页面，但照搬到正式应用会出现两类问题：

- `Access-Control-Allow-Origin: *` 与 `Access-Control-Allow-Credentials: true` 同时出现，浏览器会拒绝带凭据的请求；
- 任意来源都被允许携带凭据访问 Demo API，等于放弃来源校验。

**原因**

Demo 有两层 CORS：

| 中间件 | 行为 |
|---|---|
| `FastD\Demo\Middleware\DemoCorsMiddleware` | 回显请求的 `Origin`，固定 `Access-Control-Allow-Credentials: true`，回显 `Access-Control-Request-Headers`，`Allow-Methods` 只有 `GET, POST, OPTIONS`；`DemoServiceProvider` 会给所有 Demo 路由自动补 `OPTIONS` 路由 |
| `FastD\Demo\Middleware\CorsDemoMiddleware` | 固定 `Access-Control-Allow-Origin: *`，没有 `Vary: Origin`，`Allow-Methods` 只有 `GET, OPTIONS` |

`/cors-demo` 同时挂了两层，响应可能同时带上 `*` 和 `Access-Control-Allow-Credentials: true`，这是无效组合。Demo 的目标是让演示页面能调通，不是提供生产可用的 CORS 策略。

**绕过方式**

- 正式应用自己写白名单中间件：只回显允许的 `Origin`，加 `Vary: Origin`，按需返回 `Access-Control-Allow-Credentials: true`，并明确 `Allow-Methods` / `Allow-Headers`。
- 不要回显任意 `Access-Control-Request-Headers`，使用白名单。
- 预检请求要能匹配到 `OPTIONS` 路由；必要时显式注册。
- 生产环境移除 Demo：`composer install --no-dev`。

完整写法见 [CORS](../cookbook/cors.md)。

## 5. 旧版 ORM / 迁移 / 认证扩展不属于 8.3 核心

**现象**

按 3.x 文档寻找 ORM、数据库迁移、认证（Auth）扩展时，在 8.3 的核心依赖里找不到对应包；旧示例的类名、方法名和参数顺序也可能不适用。

**原因**

FastD 8.3 的核心依赖只有：

```text
fastd/event、fastd/container、fastd/config、fastd/middleware
fastd/http、fastd/routing、fastd/swoole
monolog/monolog、symfony/console、symfony/yaml
```

可选组件是 `fastd/cache` 与 `fastd/medoodb`。当前工作区没有 ORM、迁移工具或认证扩展包；`fastd/medoodb` 是 Medoo 查询构造器的封装，不是 ORM，也不提供实体映射、关系、迁移或认证。

**绕过方式**

- 数据库：使用 `fastd/medoodb` 或直接用 PDO；Medoo 的查询写法见[数据库](../guide/database.md)。
- 认证：写成 PSR-15 中间件（校验 Session、Token 或签名），不要照抄旧文档里的认证 API。
- 迁移：使用独立的迁移工具或版本化 SQL，不要把迁移逻辑塞进应用启动流程。
- 旧文档的参数顺序也不能照抄。例如 3.2 的 `abort(400, 'foo bar')` 与 8.3 的 `abort('foo bar', 400)` 相反，而 8.3 的 `abort()` 本身还有上面的缺陷。

判断某个扩展是否属于当前生态，以[兼容性](compatibility.md)的包清单和 `composer show 'fastd/*'` 为准。

## 6. `MessageListener` / `ReceiveListener` 与事件分发不匹配

**现象**

按类名继承 `FastD\Swoole\Listener\Server\MessageListener` 或 `ReceiveListener`，实现 `onOpen()` / `onMessage()` / `onReceive()` 后，WebSocket / TCP 连接能建立，但监听器没有任何输出，也不一定看到报错。

**原因**

这两个抽象类声明的是 Swoole 原生回调签名：

```php
abstract public function onOpen(Server $server, Request $request): void;
abstract public function onMessage(Server $server, Frame $frame): void;
```

但 `ServerEventListener::process()` 的分发方式是：

```php
$method = 'on' . ucfirst($event->event);
if (method_exists($this, $method)) {
    $this->{$method}($event);
}
```

它只传一个 `SwooleEvent`。参数数量不匹配会抛 `ArgumentCountError`；`SwooleEventDispatcher::dispatch()` 会把监听器异常收集到事件对象里，事件随后被丢弃，所以表现为“没有反应”。

**绕过方式**

- 继承 `FastD\Swoole\Listener\SwooleEventListener`，在 `process()` 中读 `$event->event` 和 `$event->args`。
- 或者继承 `MessageListener` / `ReceiveListener`，但必须重写 `process()`，自己解包参数后再调用 `onOpen()` / `onMessage()`。

可直接运行的写法见 [WebSocket 与 TCP](../cookbook/websocket-tcp.md)。

## 7. HTTP 客户端默认关闭 SSL 校验

**现象**

`FastD\Http\Request\Client` 的默认选项是：

```php
CURLOPT_SSL_VERIFYPEER => false,
CURLOPT_SSL_VERIFYHOST => false,
```

访问 HTTPS 上游时不会校验证书和主机名，存在中间人攻击风险；请求本身却能正常成功，很容易被忽略。

**绕过方式**

```php
$client = (new Client())
    ->withOption(CURLOPT_SSL_VERIFYPEER, true)
    ->withOption(CURLOPT_SSL_VERIFYHOST, 2);
```

需要自定义 CA 时再设置 `CURLOPT_CAINFO`。生产环境不要为了“能调通”长期关闭校验；测试环境也应尽量使用可信证书或显式指定 CA。

用法与其它默认值见 [HTTP 客户端](../cookbook/http-client.md)。

## 相关文档

- [兼容性](compatibility.md)
- [升级指南](upgrading.md)
- [FAQ](faq.md)
- [请求与响应](../guide/request-response.md)
- [路由与控制器](../guide/routing-controller.md)
- [Redis Session](../cookbook/redis-session.md)
- [WebSocket 与 TCP](../cookbook/websocket-tcp.md)

## 反馈

提交问题时请附上：

```bash
php -v
php --ri swoole
composer show 'fastd/*'
```

以及最小复现代码、期望行为、实际行为和完整异常栈。没有版本信息的报告很难定位，因为 8.1 / 8.2 / 8.3 在 Swoole 配置、Session 和 PHP 版本要求上都有差异。

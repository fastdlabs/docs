# 异常与日志

## 概念与职责

FastD 的异常与日志分两套，不要混淆：

| 系统 | 提供方 | 输出位置 |
|---|---|---|
| 应用日志 | Monolog，容器服务 `logger` | `runtime/logs/YYYYmm/{runtime}-{Y-m-d}.log` |
| 运行时日志 | PHP / Swoole Server | PHP-FPM 日志；Swoole 为 `runtime/logs/YYYYmm/error.log` |

框架没有全局错误处理中间件，也没有可配置的 404/500 页面。未捕获异常统一交给 `Runtime::abort()` 处理；CGI 与 Swoole 的处理结果不同。

## 日志服务

`Application::defaultServices()` 在启动时创建：

```php
$logDir = $bootstrap['log']['path'] . '/' . date('Ym');
$logFile = $logDir . '/' . $bootstrap['runtime'] . '.log';
$logger = new Logger($runtime, [
    new RotatingFileHandler($logFile, 100, $bootstrap['log']['level']),
], [], new DateTimeZone($timezone));
```

```php
// src/bootstrap.php
'log' => [
    'path' => __DIR__ . '/../runtime/logs',
    'level' => \Monolog\Level::Info, // 生产环境避免 Debug
],
```

实际行为：

- 目录 `${log.path}/YYYYmm` 不存在时递归创建，权限 0755；创建失败抛 `ErrorException`，应用启动失败。
- 文件名带日期后缀，保留最近 100 个文件。
- channel 为 runtime 名（`fastcgi`、`swoole`、`console`、`process`），同一天不同入口写不同文件。
- 低于 `log.level` 的记录直接被 Monolog 丢弃。
- 日志目录由启动进程的用户创建；Swoole 若在 `start()` 前切换运行用户，要保证新用户仍有写权限。

## 写日志

```php
debug('cache hit', ['key' => $key]);
info('order created', ['order_id' => 42]);
error('payment failed', ['order_id' => 42, 'code' => $code]);
logging(\Monolog\Logger::WARNING, 'slow request', ['ms' => 1200]);
```

等价的底层写法：

```php
logger()->error($message, $context);
logger()->log(\Monolog\Level::Warning->value, $message, $context);
```

`logging()` 的 `$level` 是 Monolog 级别值（`Monolog\Logger::WARNING` 等常量或 `Level` 枚举值）。`debug()` / `info()` / `error()` 只是固定级别的快捷方法。

## CGI 下的 abort 行为

`CgiServer::abort()` 的实际实现：

```php
$data = [
    'msg' => $throwable->getMessage(),
    'code' => $throwable->getCode(),
    'line' => $throwable->getLine(),
    'file' => $throwable->getFile(),
    'trace' => explode(PHP_EOL, $throwable->getTraceAsString()),
];
$this->application->get('logger')->error($throwable->getMessage(), $data);
(new Json(StatusCode::HTTP_INTERNAL_SERVER_ERROR, $data))->send();
```

结果：

- 日志级别 `error`，context 里带 `msg`、`code`、`line`、`file`、`trace`。
- HTTP 状态码固定 **500**，不受异常 code 影响。
- 响应体是 JSON，键为 `msg`、`code`、`line`、`file`、`trace`，其中 `trace` 是字符串数组。
- 绝对路径、行号、完整调用栈都会返回给客户端。
- 如果响应头已经发送，`send()` 仍会继续 echo，可能得到损坏的响应。

## Swoole 下的 abort 行为

启动阶段抛异常时，`SwServer::abort()` 与 CGI 类似：组装同样的 `msg/code/line/file/trace`，写 `logger()->error()`，然后 `echo json_encode(...)`。这是命令行输出，没有 HTTP 状态码。

请求阶段**不会**走 `Runtime::abort()`。异常在 `RequestListener::process()` 内被捕获：

```php
public function onException(Throwable $e): ResponseInterface
{
    return new Json(500, [
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'trace' => explode("\n", $e->getTraceAsString()),
    ]);
}
```

差异点：

- HTTP 状态码同样固定 500。
- 响应体键是 `message`（CGI 是 `msg`），并包含 `file`、`line`、`code`、`trace`。
- 不写应用日志，也不会派发 `AbortEvent`。
- 生产环境同样会暴露 trace。

## Console / Process 下的 abort 行为

两者都只在终端打印红色错误行，不写日志：

```text
[2026-10-29 12:00:00] ERROR: something failed
```

Console 的命令异常通常先被 Symfony Console 捕获并渲染，`Runtime` 看不到异常，因此仍会正常派发 `FinishEvent`，而不是 `AbortEvent`。

## 404 / 405 现状

路由未命中时，`RouteMatcher::match()` 抛 `RouteNotFoundException`：

```text
Not found Route "/foo" with "GET"
```

异常的 `getCode()` 是 404，但 `CgiServer::abort()` / Swoole `onException()` 都固定返回 HTTP 500：

```json
{
  "msg": "Not found Route \"/foo\" with \"GET\"",
  "code": 404,
  "line": 42,
  "file": "/app/vendor/...",
  "trace": ["..."]
}
```

当前实现的事实：

- **没有 405**：框架不区分“路径存在但方法不允许”，任何方法不匹配都按路由未找到处理，异常 code 仍是 404。
- **没有自动 OPTIONS**：需要显式注册 `OPTIONS` 路由。
- 404 在中间件栈创建之前抛出，路由中间件和全局中间件都捕获不到。
- 不要在 `*` 方法上注册变量兜底路由来“接管 404”：`match()` 中后匹配的 variable route 会覆盖已命中的静态路由，兜底路由会吞掉正常路由。
- 需要真正的 404 响应，只能替换入口/Server 的 abort 逻辑，见下文。

## 错误中间件示例

路由中间件可以统一处理控制器与后续中间件抛出的异常：

```php
<?php

declare(strict_types=1);

namespace Http\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Throwable;

final class ErrorMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        try {
            return $handler->handle($request);
        } catch (Throwable $throwable) {
            logger()->error($throwable->getMessage(), [
                'exception' => $throwable,
                'path' => $request->getUri()->getPath(),
            ]);

            return json(['error' => 'internal server error'], 500);
        }
    }
}
```

注册为路由中间件时放在数组第一位，才能包住后面的中间件：

```php
['GET', '/orders', OrderController::class, [ErrorMiddleware::class]],
```

也可以由 Provider push 成全局中间件，但注意：

- 全局中间件在匹配成功后才进入，**仍然捕获不到 404**。
- 先 push 的在外层。若错误中间件在 Session 内层，它先吞掉异常并返回 500，Session 随后会正常保存并写 Cookie；若错误中间件在 Session 外层，Session 的 `save()` 会被跳过。
- 中间件里 `return` 的响应不会再经过 `Runtime::abort()`，因此不会重复记录日志。

## 生产环境隐藏 trace

默认 `abort()` 无条件返回 trace。要隐藏，替换入口使用的 Server 类并覆写 `abort()`：

```php
<?php

declare(strict_types=1);

namespace Server;

use FastD\Http\Response\Json;
use FastD\Routing\Exceptions\RouteNotFoundException;
use FastD\Server\CgiServer;
use Throwable;

final class ProductionCgiServer extends CgiServer
{
    public function abort(Throwable $throwable): void
    {
        $this->application->get('logger')->error($throwable->getMessage(), [
            'exception' => $throwable,
        ]);

        $status = $throwable instanceof RouteNotFoundException ? 404 : 500;
        $payload = ['error' => $status === 404 ? 'Not Found' : 'Internal Server Error'];

        if (getenv('APP_DEBUG') === '1') {
            $payload['debug'] = [
                'message' => $throwable->getMessage(),
                'file' => $throwable->getFile(),
                'line' => $throwable->getLine(),
            ];
        }

        (new Json($status, $payload))->send();
    }
}
```

```php
// web/index.php
$cgi = new \Server\ProductionCgiServer(
    'fastcgi',
    new \FastD\Application(include __DIR__ . '/../src/bootstrap.php'),
);
$cgi->run();
```

这样同时解决 404 被包装成 500 的问题。Swoole 请求内异常要在自定义 RequestListener 中覆写 `onException()`，或改为在 listener 内自行 try/catch。

## 注意事项 / 常见错误

- 默认错误响应包含源码路径与完整 trace，生产必须替换。
- `abort()` 助手当前不可用（依赖不存在的 `HttpException`），见[辅助函数](helpers.md)。
- `RouteNotFoundException` 的 code 是 404，但 HTTP 状态仍是 500，监控不要只看状态码。
- 不要在控制器里 `echo` 后再抛异常，响应头可能已发送，`send()` 会追加内容。
- 记录异常时传 `['exception' => $throwable]` 让 Monolog 输出堆栈；不要把整个 `$_REQUEST`、Cookie、密码写进 context。
- 日志消息不要直接拼接用户输入，避免日志注入与敏感信息落盘。
- `log.level = Debug` 会记录大量调试信息，生产建议 `Info` 或更高。
- Swoole 的 `options.log_level` 只控制 Swoole 自身 `error.log`，与应用 Monolog 无关。
- `runtime/logs` 权限不足时，启动阶段就会抛 `ErrorException`，而不是等到写日志时。

## 相关链接

- [配置](configuration.md)
- [生命周期](lifecycle.md)
- [辅助函数](helpers.md)
- [中间件](middleware.md)
- [fastd/http](../components/http.md)
- [fastd/swoole](../components/swoole.md)
- [常见问题](../reference/faq.md)

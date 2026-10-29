# Redis Session

适用场景：多台应用服务器共享登录态、会话不落本地磁盘、希望在 Swoole 重启后保留会话。

FastD 的 Session 不依赖 PHP 原生 `session_start()`，而是由 `fastd/http` 的 PSR-15 中间件 + `SessionServiceProvider` 管理；Redis 只是其中一种 `SessionHandlerInterface` 实现。

## 前置条件

- PHP >= 8.4.1
- `fastd/http >= 8.2`（提供 `RedisSessionHandler`）
- `ext-redis`
- 可用的 Redis 服务（单机或可直连的代理）
- 已注册 `FastD\ServiceProvider\SessionServiceProvider`

检查扩展：

```bash
php -m | grep redis
php -r 'require "vendor/autoload.php"; var_dump(class_exists(FastD\Http\Session\Handler\RedisSessionHandler::class));'
```

第二条命令在应用根目录执行，显式加载 Composer autoload。

## 配置

### 注册 Session Provider

`config/service.php`：

```php
return [
    \FastD\ServiceProvider\SessionServiceProvider::class,
];
```

如果使用 `fastd/dobee-demo`，`DemoServiceProvider` 已经注册了 Session Provider，不需要重复添加。

### Session 配置

`config/session.php`：

```php
<?php

declare(strict_types=1);

use FastD\Http\Session\Handler\RedisSessionHandler;

return [
    'enabled' => true,
    'handler' => RedisSessionHandler::class,
    'ttl' => 1440,

    'cookie' => [
        'name' => 'FASTD_SESSID',
        'path' => '/',
        'domain' => '',
        'secure' => false,      // HTTPS 环境改为 true
        'http_only' => true,
        'same_site' => 'Lax',
    ],

    // Redis handler 也读取这里的 max_data_size 作为单会话大小上限
    'swoole_table' => [
        'size' => 2048,
        'max_data_size' => 4096,
    ],

    'redis' => [
        'host' => '127.0.0.1',
        'port' => 6379,
        'password' => null,
        'database' => 0,
        'timeout' => 1.0,
        'prefix' => 'fastd:session:',
    ],

    // Redis 会按 TTL 自动过期，gc_probability 对 Redis handler 实际是空操作
    'gc_probability' => 100,
];
```

`handler` 支持以下写法：

| 值 | 实际 Handler |
|---|---|
| `RedisSessionHandler::class` | Redis |
| `'redis'` | Redis |
| `'auto'` | Swoole 运行时用 Swoole Table，CGI 用 Native File |
| `'swoole_table'` | Swoole Table |
| `'native_file'` | 文件 |

> 注意：`auto` 不会选择 Redis。需要 Redis 时必须显式写 `RedisSessionHandler::class` 或 `'redis'`。

### 连接建立时机

`RedisSessionHandler` 由 `SessionServiceProvider` 构造，Provider 从 `config/session.php` 读取 `redis` 配置并调用 `\Redis::connect()`、`auth()`、`select()`。连接失败会抛出 `InvalidArgumentException`，应用启动失败，不会静默降级到文件 Session。

标准骨架在 `src/bootstrap.php` 的 `session` 键指向 `config/session.php`；如果容器读不到 `session` 配置，Provider 也会回退读取应用根目录下这个文件。

## 最小示例

### 登录：写入会话并轮换 ID

```php
<?php

declare(strict_types=1);

namespace App\Http\Controller;

use FastD\Http\Session\SessionMiddleware;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class LoginController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        /** @var \FastD\Http\Session\SessionInterface $session */
        $session = $request->getAttribute(SessionMiddleware::ATTRIBUTE);

        $session->set('user_id', 42);
        $session->set('roles', ['admin']);

        // 防会话固定：登录成功后换新 ID，旧 ID 的数据被销毁
        $session->regenerateId();
        $session->regenerateToken();

        return json([
            'ok' => true,
            'session_id' => $session->getId(),
        ]);
    }
}
```

### 读取会话

```php
$session = session($request); // 未启用 Session 时返回 null

if ($session === null) {
    abort('session disabled', 500);
}

$userId = $session->get('user_id');
```

`session()` 只是从请求属性 `SessionMiddleware::ATTRIBUTE` 取对象，不会自动启动 Session。

### 退出：销毁会话

```php
$session->invalidate();

return json(['ok' => true]);
```

`invalidate()` 会清空数据并调用 handler 的 `destroy()`；中间件检测到会话已结束，会下发删除 Cookie 的 `Set-Cookie`。

### CSRF 校验

```php
$token = (string) ($request->getParsedBody()['_token'] ?? '');
$session = $request->getAttribute(SessionMiddleware::ATTRIBUTE);

if (!$session->isTokenValid($token)) {
    abort('invalid csrf token', 403);
}
```

`getToken()` 首次调用会生成 32 字节随机 token 并随会话保存；`regenerateToken()` 用于轮换。

## 验证

Demo 的 `/session` 会累加访问次数并返回会话 ID：

```bash
curl -i -c /tmp/fastd.cookie http://127.0.0.1:9527/session
curl -i -b /tmp/fastd.cookie -c /tmp/fastd.cookie http://127.0.0.1:9527/session
```

第二次请求的 `visits` 应该递增。检查 Redis：

```bash
redis-cli --scan --pattern 'fastd:session:*'
redis-cli ttl 'fastd:session:<session_id>'
redis-cli get 'fastd:session:<session_id>'
```

值应为 JSON，例如：

```json
{"visits":2,"__flash":{"notice":"saved"},"__token":"..."}
```

`__flash` 和 `__token` 是 Session 的保留字段，业务不要直接读写。

## CGI / Swoole 差异

| 项目 | CGI / FastCGI | Swoole |
|---|---|---|
| 连接生命周期 | 每个请求 bootstrap 时新建连接 | bootstrap 在 Worker fork 之前，连接会被子进程继承 |
| 默认 `auto` handler | Native File | Swoole Table |
| 使用 Redis | 显式配置 `RedisSessionHandler` | 显式配置 `RedisSessionHandler` |
| 会话共享 | 依赖 Redis 或共享文件 | Swoole Table 仅本机共享，跨机需 Redis |
| 修改配置 | 下一次请求生效 | 需要重启（`reload` 不一定重读 bootstrap 配置） |

### Swoole 多 Worker 注意

`SwServer` 在 `start()` 之前完成 `Application::bootstrap()`，Redis 连接因此在 Worker fork 前建立。多个 Worker 继承同一个 phpredis 连接，不符合 phpredis 的进程模型，可能出现响应串包或连接状态异常。

上线前至少做两件事：

1. 在目标 `worker_num` 下压测登录、读写、退出流程。
2. 如果无法接受共享连接的风险，改用 Swoole Table（单机）或在 `WorkerStart` 阶段自行创建 Handler 并替换 `session.handler`。

更完整的 Session 生命周期见[基础手册 Session](../guide/session.md)。

## 注意事项

- **会话 ID 格式**：Cookie 中的 ID 必须是 32 位十六进制且存在于 Redis，否则中间件会生成新 ID，不会复用不可信值。
- **单会话大小**：Provider 把 `swoole_table.max_data_size` 传给 Redis handler，默认 `4096` 字节。JSON 编码后超过上限时 `write()` 返回 `false`，中间件记录日志但响应仍会成功，表现为“数据没保存”。
- **TTL 是滑动过期**：每次请求结束都会 `SETEX`，从最后一次写入重新计时，不是固定 24 小时。
- **Cookie 是会话 Cookie**：当前 Provider 只读取 `name/path/domain/secure/http_only/same_site`，`cookie.lifetime` 不参与 `Set-Cookie`。
- **Flash 只读一次**：`flash()` 写入的数据在下一次请求 `getFlash()` 时被消费。
- **并发写**：Session 没有加锁，同一会话的并发请求按“最后保存者覆盖”处理。验证码、购物车等强一致场景需要业务层加锁或使用独立存储。
- **不要使用原生 Session**：Swoole 常驻进程中 `session_start()` / `$_SESSION` 不可靠，FastD 也不会读写它们。
- **HTTPS**：生产环境设置 `'secure' => true`；跨站需要携带 Cookie 时，`SameSite` 通常要设为 `None` 并配合 `Secure`，同时配置 [CORS](cors.md)。
- **前缀隔离**：同一 Redis 被多个应用复用时，为每个应用配置不同的 `prefix`。
- **Redis 故障**：连接失败发生在启动阶段；运行期 Redis 超时会表现为请求变慢或保存失败，需要监控 Redis 延迟与连接数。

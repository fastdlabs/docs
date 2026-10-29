# Session

FastD Session 由 `fastd/http` 的 PSR-15 中间件和 `FastD\ServiceProvider\SessionServiceProvider` 提供。

## 启用

在 `config/service.php` 注册：

```php
return [
    \FastD\ServiceProvider\SessionServiceProvider::class,
];
```

`config/session.php`：

```php
use FastD\Http\Session\Handler\NativeFileSessionHandler;

return [
    'enabled' => true,
    'handler' => NativeFileSessionHandler::class,
    'ttl' => 1440,
    'file' => [
        'path' => __DIR__ . '/../runtime/session',
    ],
];
```

## Handler 使用类名

推荐用类名而不是字符串：

```php
NativeFileSessionHandler::class
SwooleTableSessionHandler::class
RedisSessionHandler::class
```

### Swoole Table

```php
use FastD\Http\Session\Handler\SwooleTableSessionHandler;

return [
    'enabled' => true,
    'handler' => SwooleTableSessionHandler::class,
    'swoole_table' => [
        'size' => 2048,
        'max_data_size' => 4096,
    ],
];
```

`Swoole\Table` 必须在 worker fork 前创建，Provider 会在 Application bootstrap 阶段初始化。

### Redis

```php
use FastD\Http\Session\Handler\RedisSessionHandler;

return [
    'enabled' => true,
    'handler' => RedisSessionHandler::class,
    'redis' => [
        'host' => '127.0.0.1',
        'port' => 6379,
        'password' => null,
        'database' => 0,
        'timeout' => 1.0,
        'prefix' => 'fastd:session:',
    ],
];
```

要求：

- `ext-redis`
- `fastd/http >= 8.2`

连接由 `SessionServiceProvider` 创建并注入 `RedisSessionHandler`。生产使用前需确认 Swoole 多 worker 下的连接建立时机。

### auto

```php
'handler' => 'auto'
```

- Swoole runtime：Swoole Table
- CGI runtime：Native File

## 读取 Session

```php
use FastD\Http\Session\SessionMiddleware;

$session = $request->getAttribute(SessionMiddleware::ATTRIBUTE);

// 或 helper
$session = session($request);
```

## 常用 API

```php
$session->set('user_id', 1);
$user = $session->get('user_id');
$session->remove('user_id');
$session->all();
$session->clear();

// flash：本请求写入，下一次请求读取一次
$session->flash('notice', 'saved');
$notice = $session->getFlash('notice');

// CSRF
$token = $session->getToken();
$session->isTokenValid($postedToken);
$newToken = $session->regenerateToken();

// 登录/权限变更后轮换 ID
$newId = $session->regenerateId();

// 注销
$session->invalidate();
```

## Cookie

默认 `FASTD_SESSID`，默认 `HttpOnly`、`SameSite=Lax`、`Path=/`。可通过 session 配置覆盖：

```php
'cookie' => [
    'name' => 'FASTD_SESSID',
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'http_only' => true,
    'same_site' => 'Lax',
],
```

## 注意

- Session ID 必须是 32 位十六进制；非法/未知 ID 会创建新会话。
- Session 数据以 JSON 存储，避免放入不可序列化对象。
- Swoole 常驻进程下不要依赖 PHP 原生 `session_start()`/`$_SESSION`。

更多见 [fastd/http Session](../components/http.md) 和 [Redis Session 场景](../cookbook/redis-session.md)。

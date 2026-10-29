# 辅助函数

## 概念与职责

`fastD/helpers.php` 通过 Composer 的 `files` autoload 全局加载（`autoload.files`），提供一组无命名空间的快捷函数。它们都依赖已经创建并 bootstrap 的 `Application`，不能在没有应用的脚本里直接使用。

## 全部函数

| 函数 | 真实签名 | 返回 / 用途 |
|---|---|---|
| `container()` | `container(): Application` | 当前 `Application::$application` |
| `config()` | `config(): FileParser` | 配置解析器对象，不是数组 |
| `event()` | `event(): EventDispatcher` | 事件调度器（Swoole 下是 `SwooleEventDispatcher`） |
| `logger()` | `logger(): Logger` | Monolog Logger，channel 为当前 runtime |
| `debug()` | `debug(string $message, array $context = []): void` | `logger()->debug()` |
| `info()` | `info(string $message, array $context = []): void` | `logger()->info()` |
| `error()` | `error(string $message, array $context = []): void` | `logger()->error()` |
| `logging()` | `logging(int $level, string $message, array $context = []): void` | `logger()->log($level, ...)` |
| `forward()` | `forward(ServerRequestInterface $request, string $method, string $path): ResponseInterface` | 用新方法/路径重新走路由 |
| `abort()` | `abort(string $message, int $statusCode = StatusCode::HTTP_BAD_REQUEST): void` | **当前不可用**，见下文 |
| `text()` | `text(string $content = '', int $statusCode = StatusCode::HTTP_OK): ResponseInterface` | `Text` 响应 |
| `json()` | `json(array $content = [], int $statusCode = StatusCode::HTTP_OK): ResponseInterface` | `Json` 响应 |
| `session()` | `session(ServerRequestInterface $request): ?SessionInterface` | 读取请求属性中的会话 |
| `sse()` | `sse(iterable|\Closure $producer, array $options = []): SseResponse` | 创建 SSE 响应 |

## 常用示例

```php
$app = container();
$env = $app->getRuntime();          // fastcgi / swoole / console / process

$cache = config()->parsed->get('cache.file.lifetime', 3600);
$host = config()->var->get('database.default.host');

info('order paid', ['order_id' => 42]);
logging(\Monolog\Logger::WARNING, 'slow query', ['ms' => 1200]);

return json(['ok' => true], 201);
return text('not modified', 304);
```

### forward()：必须显式传 request

```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class LegacyController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return forward($request, 'GET', '/internal/order/42');
    }
}
```

`forward()` 的实现是：

```php
return container()->get('matcher')->dispatch(
    $request->withMethod($method)->withUri(new Uri($path))
);
```

实际行为：

- 请求的方法与 URI 被替换，body、attributes、cookies 保留。
- 会重新走一遍 matcher：全局中间件与目标路由的中间件都会执行。
- 新 URI 只由传入的 `$path` 构造；需要 host 或 query 时把它们写进 `$path`，否则原 host/query 会丢失。
- 返回目标路由的响应对象，不会自动发送；把它 `return` 出去即可。
- 原请求已带 `session` 属性时，SessionMiddleware 会直接放行，不会重复保存或重复写 Cookie。

没有 `request()` 之类的助手，控制器必须通过参数接收 `ServerRequestInterface`。

### session()：每个请求显式读取

```php
$session = session($request);

if ($session === null) {
    return json(['error' => 'session disabled'], 400);
}

$session->set('user_id', 1);
```

会话对象是 per-request 的，必须显式传入当前请求；不要把它放进容器当单例。未启用 Session 或属性不存在时返回 `null`，不会抛异常。

### text() / json()

```php
$response = json(['items' => []], 200)
    ->withHeader('X-Request-Id', 'abc');
```

两者都只是构造 `FastD\Http\Response\Text` / `Json` 并返回，不会设置其它业务头；需要额外头或 Cookie 时继续用 PSR-7 的 `withHeader()` / `withAddedHeader()`。

### sse()

```php
return sse((function () {
    yield ['tick' => 1];
    yield 'done';
})());
```

`$options` 支持 `heartbeat`、`max_duration`、`retry`、`error_event`、`headers`、`on_error`。Swoole 下由 `RequestListener` 识别 `SseResponse` 并切换 `SwooleEmitter`，CGI 下由 `CgiEmitter` 输出。详见 [SSE 场景](../cookbook/sse.md)。

## 已知限制：abort()

`helpers.php` 中的定义：

```php
function abort(string $message, int $statusCode = StatusCode::HTTP_BAD_REQUEST): void
{
    throw new HttpException((empty($message) ? StatusCode::PHRASES[$statusCode] : $message), $statusCode);
}
```

`HttpException` 在当前源码和依赖中**没有定义**，且 `helpers.php` 没有命名空间，解析的是全局 `HttpException`。因此：

- 调用 `abort()` 会得到 `Error: Class "HttpException" not found`，而不是一个带状态码的 HTTP 异常。
- CGI 下该 `Error` 会被 `Runtime::process()` 捕获，最终返回 500，响应内容包含 `Class "HttpException" not found` 与 trace。
- 不要把它当推荐 API 使用，也不要围绕它设计错误流程。

可用的替代方式：

```php
// 直接返回状态码
return json(['error' => 'invalid token'], 403);

// 或抛出业务异常，由自定义错误中间件映射状态码
throw new \DomainException('invalid token');
```

## 注意事项 / 常见错误

- `config()` 返回 `FileParser`，没有 `get()`；用 `config()->parsed->get('key')` 或 `container()->config('name')`。
- `config()->parsed` 只包含已经解析过的文件；未解析前读到的是默认值。
- `container()` 依赖 `Application` 构造时写入的静态属性；在 `new Application()` 之前或纯脚本中调用会失败。
- 同一进程创建多个 Application 时，`container()` 指向最后构造的那个；测试里要注意隔离。
- `logger()` 在 bootstrap 之前不可用；`debug()` / `info()` 等同样。
- `event()` 在 Swoole 下返回 `SwooleEventDispatcher`，停止传播的行为与 CGI 不同。
- `json()` 只接受数组；传对象或字符串会触发类型错误。
- 没有 `redirect()` 助手，重定向用 `FastD\Http\Response\Redirect`。
- `error()` 是业务日志函数，不是 PHP 的 `error_log()`，也不会改变 PHP 错误处理器。

## 相关链接

- [fastd/fastd](../components/fastd.md)
- [fastd/http](../components/http.md)
- [fastd/config](../components/config.md)
- [fastd/event](../components/event.md)
- [请求与响应](request-response.md)
- [异常与日志](error-logging.md)
- [SSE 场景](../cookbook/sse.md)

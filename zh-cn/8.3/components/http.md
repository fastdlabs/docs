# fastd/http

FastD 8.3 生态中的 HTTP 基础组件（8.2 版本线），提供 PSR-7 / PSR-17 / PSR-18 消息、请求、响应、客户端与 Session 能力。

## 用途与定位

- 完整实现 PSR-7（HTTP Message）、PSR-17（HTTP Factory）、PSR-18（HTTP Client）
- 服务端请求适配：CGI 全局变量、Swoole 请求
- 常用响应类型：`Text`、`Json`、`Redirect`、SSE
- 附带 `Cookie`、`Uri`、`Stream`、上传文件与 PSR-15 Session 中间件

`fastd/routing`、`fastd/middleware`、`fastd/swoole` 都依赖本组件，框架里的 PSR-7 请求/响应对象也来自这里。

## 安装

```bash
composer require fastd/http
```

- PHP >= 8.4.1
- `ext-curl`、`ext-json`、`ext-zlib`
- 可选：`ext-swoole`（`SwooleTableSessionHandler`）、`ext-redis`（`RedisSessionHandler`）

## 核心 API / 类

| 类 | 说明 |
|---|---|
| `FastD\Http\Factory` | PSR-17 工厂：`createRequest()`、`createResponse()`、`createServerRequest()`、`createStream()`、`createUri()` |
| `FastD\Http\Request\Request` | PSR-7 请求，构造参数 `(method, uri, headers, body, version)` |
| `FastD\Http\Request\ServerRequest` | 服务端请求；`fromGlobals()` 从 `$_SERVER`/`$_GET`/`$_POST`/`$_FILES` 创建 |
| `FastD\Http\Request\SwooleServerRequest` | `fromSwoole(Swoole\Http\Request $request)` 转换 Swoole 请求 |
| `FastD\Http\Request\Client` | PSR-18 客户端：`sendRequest()`、`send()`、`withOption()`、`withCookie()` |
| `FastD\Http\Response\Text` | 文本响应：`withStatus()`、`withHeader()`、`withCookie()`、`withContents()`、`send()` |
| `FastD\Http\Response\Json` | JSON 响应，构造参数 `(status, array $body, headers)`，支持数组访问 |
| `FastD\Http\Response\Redirect` | 重定向响应：`new Redirect($uri, $status = 302)` |
| `FastD\Http\Response\SseResponse` | SSE 流式响应，构造参数为生成器或 `Closure(EmitterInterface)` |
| `FastD\Http\Sse\Event` | SSE 事件：`Event::data($data, $event, $id, $retry)` |
| `FastD\Http\Sse\EmitterInterface` | 发送器：`send()`、`comment()`、`retry()`、`isClosed()`、`close()` |
| `FastD\Http\Cookie` | Cookie：`Cookie::create(name, value, expire, path, domain, secure, httpOnly, sameSite)` |
| `FastD\Http\Uri` | URI 解析与不可变修改 |
| `FastD\Http\Stream\Stream` | Stream 封装：`Stream::create($content)`、`new Stream($path, $mode)` |
| `FastD\Http\Request\UploadedFile` | 上传文件：`getClientFilename()`、`getSize()`、`moveTo()` |
| `FastD\Http\Session\SessionMiddleware` | PSR-15 Session 中间件，请求属性名 `session` |
| `FastD\Http\Session\Handler\NativeFileSessionHandler` | 文件存储（CGI 默认） |
| `FastD\Http\Session\Handler\SwooleTableSessionHandler` | Swoole Table 存储（`ttl, size, max_data_size`） |
| `FastD\Http\Session\Handler\RedisSessionHandler` | Redis 存储（`Redis $redis, ttl, prefix, max_data_size`） |

请求读取：

```php
$request->getMethod();
$request->getUri()->getPath();
$request->getQueryParams();
$request->getParsedBody();
$request->getUploadedFiles();
$request->getCookieParams();
$request->getAttribute('name', $default);
```

## 配置

本组件没有独立配置文件，行为由构造参数决定。在 FastD 应用中，Session 通过 `config/session.php` 与 `SessionServiceProvider` 装配。

`SessionMiddleware` 构造参数（按顺序）：

| 参数 | 默认值 | 说明 |
|---|---|---|
| `$handler` | 必填 | `NativeFile` / `SwooleTable` / `Redis` handler |
| `$cookieName` | `FASTD_SESSID` | 会话 Cookie 名 |
| `$cookiePath` | `/` | Cookie Path |
| `$cookieDomain` | `''` | Cookie Domain |
| `$cookieSecure` | `false` | 仅 HTTPS 发送 |
| `$cookieHttpOnly` | `true` | HttpOnly |
| `$cookieSameSite` | `Lax` | SameSite |
| `$onError` | `null` | 持久化失败回调 |
| `$gcProbability` | `0` | 过期清理概率（1/N） |

SSE 选项：`heartbeat`、`max_duration`、`retry`、`error_event`、`headers`、`on_error`。

## 最小示例

控制器读取请求并返回 JSON：

```php
use FastD\Http\Request\ServerRequest;
use FastD\Http\Response\Json;

$request = ServerRequest::fromGlobals();
$name = $request->getQueryParams()['name'] ?? 'fastd';

return new Json(200, [
    'name' => $name,
    'path' => $request->getUri()->getPath(),
]);
```

PSR-18 客户端：

```php
use FastD\Http\Request\Client;
use FastD\Http\Request\Request;

$client = new Client();
$request = (new Request('GET', 'https://api.example.com/users'))
    ->withHeader('Accept', 'application/json');

$response = $client->sendRequest($request);
$data = json_decode((string) $response->getBody(), true);
```

SSE：

```php
use FastD\Http\Response\SseResponse;
use FastD\Http\Sse\Event;
use FastD\Http\Sse\EmitterInterface;

return new SseResponse(function (EmitterInterface $emitter): void {
    $emitter->comment('connected');
    $emitter->send(Event::data(['tick' => 1], 'message', '1'));
    $emitter->send(Event::data('done', 'done'));
}, ['heartbeat' => 15, 'retry' => 3000]);
```

## 注意事项

- 工厂方法以源码为准：`ServerRequest::fromGlobals()`、`SwooleServerRequest::fromSwoole()`；README 旧示例中的 `createServerRequestFromGlobals()` / `createServerRequestFromSwoole()` 已不存在。
- `Json` 的数组访问（`$json['x'] = ...`）只修改内部 `parsedBody`，不会改写响应体；要改响应内容需重新构造 `Json` 或调用 `withContents()`。
- `Client` 默认关闭 SSL 校验（`CURLOPT_SSL_VERIFYPEER/VERIFYHOST = false`）、跟随最多 3 次跳转、超时 30s；生产环境用 `withOption()` 覆盖。`withOption()` / `withCookie()` 返回新实例。
- `Client` 依据响应 `Content-Type` 是否包含 `application/json` 返回 `Json` 或 `Text`；读取响应体用 `(string) $response->getBody()`。
- `Cookie` 的 `expire` 是相对秒数；值为空字符串表示删除 Cookie；`SameSite=Lax` 不会写入字符串（浏览器默认值）。
- `fromGlobals()` 的 POST 数据来自 `$_POST`。PUT/PATCH/DELETE/OPTIONS 虽然会尝试解析 body，但当前实现传入的是空的 `php://memory` 流，读不到原始请求体；需要原始 body 时用 `new Stream('php://input', 'r')` 自行构造请求。
- SSE 生产者不要直接 `echo`/`flush`，统一通过 `EmitterInterface`；Swoole 运行时由 `SwooleEmitter` 输出。
- Session ID 必须是 32 位十六进制；未知或畸形 ID 会新建会话。`SwooleTableSessionHandler` 必须在 worker fork 前创建，FastD 中交给 `SessionServiceProvider`。

## 相关源码 / README

- [fastd/http README](https://github.com/fastdlabs/http/blob/master/README.md)
- [请求与响应](../guide/request-response.md)
- [Session](../guide/session.md)
- [SSE 场景](../cookbook/sse.md)
- [上传与下载](../cookbook/upload-download.md)
- [Redis Session](../cookbook/redis-session.md)
- [组件总览](README.md)

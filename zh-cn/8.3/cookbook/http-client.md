# HTTP 客户端（PSR-18）

适用场景：服务端调用第三方 API、聚合上游数据、发送 Webhook、在 Controller 或 Console 命令里发起 HTTP 请求。

FastD 的客户端是 `FastD\Http\Request\Client`，实现 PSR-18 `ClientInterface`，底层使用 cURL。响应会按 `Content-Type` 转成 FastD 的 `Json` 或 `Text` 对象，可以直接复用框架的响应读取方式。

## 前置条件

- PHP >= 8.4.1
- `ext-curl`、`ext-json`、`ext-zlib`（解码 gzip / deflate 响应）
- `fastd/http`（8.3 应用默认安装；文档验证版本 8.2.1）
- 如果运行在 Swoole 协程中，先阅读后文“与 Swoole 协程客户端的区别”

## 初始化

```php
use FastD\Http\Request\Client;

$client = new Client();
```

默认选项：

| cURL 选项 | 默认值 | 说明 |
|---|---|---|
| `CURLOPT_HEADER` | `true` | 客户端要靠它拆分响应头，不能关闭 |
| `CURLOPT_RETURNTRANSFER` | `true` | 客户端要靠它拿到响应体，不能关闭 |
| `CURLOPT_USERAGENT` | `Client::USER_AGENT` | `PHP Curl/1.1 (+https://github.com/fastdlabs/http)` |
| `CURLOPT_TIMEOUT` | `30` | 总超时（秒） |
| `CURLOPT_CONNECTTIMEOUT` | `10` | 连接超时（秒） |
| `CURLOPT_SSL_VERIFYPEER` | `false` | 默认不校验证书，生产必须改 |
| `CURLOPT_SSL_VERIFYHOST` | `false` | 默认不校验主机名，生产必须改 |
| `CURLOPT_FOLLOWLOCATION` | `true` | 自动跟随重定向 |
| `CURLOPT_MAXREDIRS` | `3` | 最大重定向次数 |

> 构造参数会**整体替换**默认选项，不会与默认值合并。`new Client([CURLOPT_TIMEOUT => 5])` 会同时丢掉 `CURLOPT_HEADER` 和 `CURLOPT_RETURNTRANSFER`，响应解析随即失效。需要改单项时用 `withOption()`，或者传入完整选项表。

推荐写法：

```php
$client = (new Client())
    ->withOption(CURLOPT_TIMEOUT, 5)
    ->withOption(CURLOPT_CONNECTTIMEOUT, 2);
```

## 最小示例

### GET

```php
<?php

declare(strict_types=1);

use FastD\Http\Request\Client;
use FastD\Http\Request\Request;

$client = new Client();

$response = $client->sendRequest(new Request('GET', 'https://api.example.com/users/1'));

$status = $response->getStatusCode();
$body = $response->getContents();
$data = json_decode($body, true);
```

`sendRequest()` 是 PSR-18 方法，只接收一个请求对象。需要 query、header、body 选项时用 FastD 扩展的 `send()`。

### POST JSON

```php
$response = $client->send(
    new Request('POST', 'https://api.example.com/users'),
    [
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ],
        'body' => [
            'name' => 'Ada',
            'role' => 'admin',
        ],
    ],
);
```

`send()` 的 `body` 会按 `Content-Type` 编码：

| Content-Type | 数组 body 的处理 |
|---|---|
| `application/json` | `json_encode`（`JSON_UNESCAPED_UNICODE`） |
| `application/x-www-form-urlencoded` | `http_build_query` |
| `text/plain` | 转成字符串 |
| 未设置 | 按 `application/x-www-form-urlencoded` 处理 |

不支持的 Content-Type 会抛 `RuntimeException`。`multipart/form-data` 分支没有实现真正的 multipart 编码，**不能用于文件上传**，见下文“限制与注意事项”。

### 手动构造请求体

如果必须用 `sendRequest()`，注意它从流的**当前指针**读取 body，不会自动 rewind：

```php
use FastD\Http\Stream\Stream;

$stream = Stream::create(json_encode(['name' => 'Ada'], JSON_UNESCAPED_UNICODE));
$stream->rewind();

$request = (new Request('POST', 'https://api.example.com/users'))
    ->withHeader('Content-Type', 'application/json')
    ->withBody($stream);

$response = $client->sendRequest($request);
```

`Stream::create()` 写入后指针在末尾；不 `rewind()` 会发送空 body。同一个请求对象也不要重复发送，body 已经被读完。

### Query 与 Header

```php
$response = $client->send(new Request('GET', 'https://api.example.com/search'), [
    'query' => [
        'q' => 'fastd',
        'page' => 2,
    ],
    'headers' => [
        'Accept' => 'application/json',
        'X-Request-Id' => $requestId,
    ],
]);
```

- `query` 使用 `withQuery()` **覆盖** URL 中已有 query，不是追加；值会自动 `http_build_query` 编码。
- `headers` 使用 `withHeader()`，同名头会被替换；值可以传数组表示多个同名头。

## 响应

响应类型由 `Content-Type` 决定：

| 上游 Content-Type | 返回对象 |
|---|---|
| 包含 `application/json` | `FastD\Http\Response\Json` |
| 其它 | `FastD\Http\Response\Text` |

`Json` 继承 `Text`；两者都提供：

| 方法 | 说明 |
|---|---|
| `getStatusCode()` | HTTP 状态码 |
| `getHeaderLine($name)` | 响应头，名称大小写不敏感（内部统一小写） |
| `getContents()` | 读取完整 body，会先 rewind |
| `(string) $response->getBody()` | 读取完整 body，`__toString()` 会 rewind |

`Json` 还实现了 `ArrayAccess`，可以直接读取解析后的数组：

```php
if ($response instanceof \FastD\Http\Response\Json) {
    $name = $response['name'] ?? null;
}
```

- `offsetSet()` 只改内部 `parsedBody`，**不会**同步改写底层 stream，不要在返回响应后再修改。
- JSON 解析失败时 `parsedBody` 退化为 `[]`，状态码仍然保留；需要区分“空对象”和“坏 JSON”时自己再 `json_decode()` 一次。
- 响应头名称会被转成小写；`Set-Cookie` 不会留在响应头里，而是进入客户端的 Cookie 罐，见下一节。

4xx / 5xx 也是正常响应，不会抛异常：

```php
if ($response->getStatusCode() >= 400) {
    logger()->warning('upstream error', [
        'status' => $response->getStatusCode(),
        'body' => $response->getContents(),
    ]);
}
```

## Cookie

```php
use FastD\Http\Cookie;

$client = (new Client())->withCookie(Cookie::create('session', 'abc123'));

$response = $client->sendRequest(new Request('GET', 'https://api.example.com/me'));
```

- 客户端把 Cookie 罐里的所有 Cookie 拼成 `Cookie` 请求头，名称和值会 `urlencode`。
- 响应的 `Set-Cookie` 会被解析并写入**同一个客户端实例**的 Cookie 罐；之后用这个实例发请求会自动带上。
- `$response->getCookies()` 是发送后 Cookie 罐的快照，不只有本次 `Set-Cookie` 的内容。
- `withCookie()` 返回克隆，原实例不变：

```php
$base = new Client();
$loggedIn = $base->withCookie(Cookie::create('session', 'abc123'));

count($base->getCookies());     // 0
count($loggedIn->getCookies()); // 1
```

Cookie 罐只存在于内存，没有持久化。跨请求复用会话时，保留同一个 `Client` 实例，或自己保存 Cookie 再 `withCookie()`。

## 超时、SSL 与其它 cURL 选项

```php
$client = (new Client())
    ->withOption(CURLOPT_TIMEOUT, 5)
    ->withOption(CURLOPT_CONNECTTIMEOUT, 2)
    ->withOption(CURLOPT_SSL_VERIFYPEER, true)
    ->withOption(CURLOPT_SSL_VERIFYHOST, 2)
    ->withOption(CURLOPT_CAINFO, '/etc/ssl/certs/ca-certificates.crt');
```

| 场景 | 选项 |
|---|---|
| 总超时 | `CURLOPT_TIMEOUT`（秒）或 `CURLOPT_TIMEOUT_MS`（毫秒） |
| 连接超时 | `CURLOPT_CONNECTTIMEOUT` 或 `CURLOPT_CONNECTTIMEOUT_MS` |
| 开启证书校验 | `CURLOPT_SSL_VERIFYPEER => true`、`CURLOPT_SSL_VERIFYHOST => 2` |
| 自定义 CA | `CURLOPT_CAINFO` |
| 代理 | `CURLOPT_PROXY`、`CURLOPT_PROXYUSERPWD` |
| 重定向上限 | `CURLOPT_MAXREDIRS` |

`withOption(int $curlOpt, mixed $value): self` 同样返回克隆，不会修改原客户端：

```php
$slow = (new Client())->withOption(CURLOPT_TIMEOUT, 30);
$fast = $slow->withOption(CURLOPT_TIMEOUT, 2);

$slow->getOptions()[CURLOPT_TIMEOUT]; // 30
$fast->getOptions()[CURLOPT_TIMEOUT]; // 2
```

- **不要关闭 `CURLOPT_HEADER` 或 `CURLOPT_RETURNTRANSFER`**。前者用于拆分响应头，后者用于拿到响应体；关掉后客户端会抛 `ClientException` 或表现异常。
- 超时要同时设置连接超时和总超时，只有总超时时，DNS / TCP 建连阶段可能先卡住。
- 默认不校验证书，生产环境如果访问 HTTPS 必须显式开启，否则存在中间人风险。

## 异常类型与错误处理

客户端把 cURL 错误映射为 PSR-18 异常：

| 异常 | 触发条件 | `getCode()` | 实现的接口 |
|---|---|---|---|
| `FastD\Http\Exception\NetworkException` | `CURLE_OPERATION_TIMEDOUT`（超时） | `408` | `NetworkExceptionInterface` |
| `FastD\Http\Exception\RequestException` | DNS 失败、无法连接 | `502` | `RequestExceptionInterface` |
| `FastD\Http\Exception\RequestException` | `CURLE_GOT_NOTHING`（上游未返回内容） | `504` | `RequestExceptionInterface` |
| `FastD\Http\Exception\ClientException` | 其它 cURL 错误、无 HTTP 状态码、响应格式非法 | `500` | `ClientExceptionInterface` |

继承关系：`NetworkException` / `RequestException` 都继承 `ClientException`；三者都实现 `Psr\Http\Client\ClientExceptionInterface`。

```php
use FastD\Http\Exception\ClientException;
use FastD\Http\Exception\NetworkException;
use FastD\Http\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;

try {
    $response = $client->sendRequest($request);
} catch (NetworkException $e) {
    // 超时，可有限重试
} catch (RequestException $e) {
    // DNS / 连接失败 / 空响应，通常是上游不可用
} catch (ClientExceptionInterface $e) {
    // 其它传输层错误；ClientException 也在这里被捕获
}
```

- 捕获顺序要从具体到宽泛：`NetworkException`、`RequestException` 在前，`ClientException` / `ClientExceptionInterface` 在后。
- 4xx / 5xx **不抛异常**，必须自己检查状态码；PSR-18 只要求传输错误抛 `ClientExceptionInterface`。
- `NetworkException` / `RequestException` 提供 `getRequest()`，可以拿到触发错误的请求对象。
- `ClientException` 继承 `RuntimeException`；请求方法非法时 `Request` 构造器抛 `InvalidArgumentException`；`send()` 遇到不支持的 Content-Type 时抛 `RuntimeException`，它们都不属于 PSR-18 异常。

只对可重试的错误做有限重试：

```php
$attempts = 0;

while (true) {
    try {
        return $client->sendRequest($request);
    } catch (NetworkException | RequestException $e) {
        if (++$attempts >= 3) {
            throw $e;
        }

        // 指数退避；Swoole 协程中用 Coroutine::sleep()
        usleep(200_000 * $attempts);
    }
}
```

重试前要重新构造请求或 `rewind()` body；非幂等请求（如创建订单）应配合幂等键，不要盲目重试。

## 与 Swoole 协程客户端的区别

`FastD\Http\Request\Client` 是同步 cURL 客户端。在 Swoole 协程上下文中调用 `curl_exec()` 会阻塞当前 Worker，同一个 Worker 里的其它请求都要排队。

| 项目 | FastD `Client` | `Swoole\Coroutine\Http\Client` |
|---|---|---|
| 实现 | cURL，同步阻塞 | 协程，非阻塞 |
| PSR-18 | 是 | 否 |
| CGI / FPM | 可用 | 不可用（需要协程） |
| Swoole Worker | 阻塞整个 Worker | 让出协程，可并发 |
| 超时 | `CURLOPT_TIMEOUT` / `CURLOPT_TIMEOUT_MS` | `set(['timeout' => 2.0])` |
| 文件上传 | 不支持 multipart | 支持 `addFile()` |

**不要在 Swoole 协程中直接用阻塞 cURL。** `enable_coroutine => true` 不会把 cURL 变成异步；Swoole 是否 hook curl 取决于运行环境编译和 hook 配置，框架没有对此做保证。把 `Client` 放进 `Parallel` 也无效：阻塞调用会卡住整个进程，多个协程无法重叠执行。

协程中改用 Swoole 原生客户端：

```php
use Swoole\Coroutine;

if (Coroutine::getCid() > 0) {
    $client = new \Swoole\Coroutine\Http\Client('api.example.com', 443, true);
    $client->set([
        'timeout' => 2.0,
        'ssl_host_name' => 'api.example.com',
    ]);

    $ok = $client->get('/v1/users/1');
    $status = $client->statusCode;
    $body = $client->body;
    $client->close();

    if (!$ok) {
        // 连接失败或超时，按 Swoole 客户端的错误处理
    }

    $data = json_decode($body, true);

    return json(['data' => $data]);
}

// 非协程（CGI）继续使用 PSR-18 客户端
$response = (new Client())->sendRequest(new Request('GET', 'https://api.example.com/v1/users/1'));
```

并发调用多个上游时，用 `Parallel` 包住**协程客户端**，而不是包住 `Client`：

```php
use FastD\Swoole\Concurrency\Parallel;

$result = Parallel::all([
    'user' => function (): array {
        $client = new \Swoole\Coroutine\Http\Client('user.internal', 80);
        $client->get('/users/1');
        $result = ['status' => $client->statusCode, 'body' => $client->body];
        $client->close();

        return $result;
    },
    'orders' => function (): array {
        $client = new \Swoole\Coroutine\Http\Client('order.internal', 80);
        $client->get('/orders?user_id=1');
        $result = ['status' => $client->statusCode, 'body' => $client->body];
        $client->close();

        return $result;
    },
], 1.0);
```

`Parallel` 的运行时差异见 [Parallel](parallel.md)。

## 限制与注意事项

- **不支持 multipart 上传**：`send()` 的 `multipart/form-data` 分支只是 `serialize($rawData)`，不是合法的 multipart 请求体。上传请直接用 cURL（`CURLFile`）、Swoole 协程客户端的 `addFile()`，或先写临时文件再流式上传。
- **`send()` 不是 PSR-18 方法**：`send($request, $options)` 是 FastD 扩展；需要与其它 PSR-18 客户端互换时只调用 `sendRequest()`。
- **响应只按 Content-Type 粗分类**：`text/plain` 的 JSON 字符串会返回 `Text`，需要自己 `json_decode()`；`Json` 解析失败会得到空数组。
- **客户端不设置 `Accept-Encoding`**：不要指望自动压缩；如果上游强制返回 gzip，客户端只在响应头包含 `content-encoding: gzip|deflate` 时用 `zlib_decode()` 解压。
- **Cookie 罐是实例级的**：只保存在当前客户端实例内，不会跨进程或落盘持久化；高并发下不要共享同一个客户端实例去承载不同用户的会话。
- **错误信息可能包含上游地址**：记录日志时不要把带签名参数的完整 URL 原样打出来。
- **生产环境显式开启 SSL 校验**：默认 `CURLOPT_SSL_VERIFYPEER` / `CURLOPT_SSL_VERIFYHOST` 都是关闭的。
- **设置合理的超时和重试上限**：上游故障时，无限重试会拖垮调用方。

## 相关文档

- [请求与响应](../guide/request-response.md)
- [组件：fastd/http](../components/http.md)
- [并行编排](parallel.md)
- [运行时](../guide/runtime.md)
- [已知问题](../reference/known-issues.md)

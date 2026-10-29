# 请求与响应

## 读取请求

Controller 接收 PSR-7 `ServerRequestInterface`：

```php
$method = $request->getMethod();
$path = $request->getUri()->getPath();
$query = $request->getQueryParams();
$headers = $request->getHeaders();
$cookies = $request->getCookieParams();
$body = $request->getParsedBody();
$files = $request->getUploadedFiles();
$attribute = $request->getAttribute('name');
```

### Header

```php
$request->getHeaderLine('Authorization');
$request->getHeader('Accept');
```

### JSON body

FastD 的 `ServerRequest::fromGlobals()` 会解析请求体；测试中可用 `withParsedBody()`。

## 响应类型

### JSON

```php
return json(['code' => 0, 'data' => []]);
return json(['error' => 'bad request'], 400);
```

### Text

```php
return text('hello');
return text('created', 201);
```

### Redirect

```php
use FastD\Http\Response\Redirect;

return new Redirect('/login');
```

### 自定义状态/Header

```php
$response = json(['ok' => true]);
$response = $response->withStatus(202);
$response = $response->withHeader('X-Trace-Id', 'abc');
```

## Cookie

```php
use FastD\Http\Cookie;

$response = json(['ok' => true])
    ->withCookie(Cookie::create('theme', 'dark', 3600));
```

`Cookie::create(name, value, expire, path, domain, secure, httpOnly, sameSite)`；`expire` 是相对秒数。

## 文件上传

```php
$file = $request->getUploadedFiles()['file'] ?? null;

if ($file !== null) {
    $file->moveTo($root . '/runtime/uploads/' . basename($file->getClientFilename()));
}
```

不要把客户端文件名直接当作路径；生产环境应校验大小、类型并生成安全文件名。

## 文件下载 / Stream

```php
use FastD\Http\Response\Text;
use FastD\Http\Stream\Stream;

$stream = new Stream('php://temp', 'w+b');
$stream->write("id,name\n1,fastd\n");
$stream->rewind();

$response = (new Text(200, ''))
    ->withHeader('Content-Type', 'text/csv; charset=UTF-8')
    ->withHeader('Content-Disposition', 'attachment; filename="data.csv"')
    ->withBody($stream);
```

## SSE

```php
use FastD\Http\Response\SseResponse;
use FastD\Http\Sse\Event;

return new SseResponse(function ($emitter): void {
    $emitter->send(Event::data(['message' => 'hello'], 'message', '1'));
});
```

CGI/Swoole 都会输出 SSE；Swoole 下由 `SwooleEmitter` 处理心跳与断连。详见[SSE 场景](../cookbook/sse.md)。

## 辅助函数

| 函数 | 说明 |
|---|---|
| `json(array, status)` | JSON 响应 |
| `text(string, status)` | 文本响应 |
| `sse(producer, options)` | SSE 响应 |
| `abort(message, status)` | 抛出 HTTP 异常 |
| `session(request)` | 读取 Session |
| `forward(request, method, path)` | 通过 matcher 重新派发 |

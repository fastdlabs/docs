# SSE（Server-Sent Events）

适用场景：实时通知、任务进度、日志尾部、AI 逐字输出。FastD 用 `SseResponse` 表示 SSE 响应，同一段生产者代码可在 CGI 与 Swoole 下运行；Swoole 运行时由 `SwooleEmitter` 负责心跳、背压和断连取消。

## 前置条件

- PHP >= 8.4.1
- `fastd/http`（`SseResponse`、`Event`、`EmitterInterface`）
- Swoole 运行时需要 `fastd/swoole >= 8.2` 与 `ext-swoole >= 6.0`
- Swoole 必须开启协程：`enable_coroutine => true`

## 配置

### CGI / FastCGI

不需要框架配置。注意 Web 服务器与 PHP 的超时、压缩和输出缓冲：

```nginx
location /sse {
    proxy_pass http://backend;
    proxy_buffering off;
    proxy_read_timeout 3600s;
    gzip off;
}
```

如果后端是 PHP-FPM，用 `fastcgi_pass`，并同步调整 `fastcgi_read_timeout`；核心是关闭缓冲与压缩、放大读超时。

`SseResponse` 默认发送 `X-Accel-Buffering: no`，可让 Nginx 关闭自身缓冲；仍建议显式配置 `proxy_buffering off`。

### Swoole

`config/swoole.php` 的 `options`：

```php
return [
    'servers' => [
        'http' => [
            'host' => '127.0.0.1',
            'port' => 9527,
            'listener' => \FastD\Listener\Server\SwHttpListener::class,
        ],
    ],
    'listeners' => [
        \FastD\Swoole\Listener\Server\WorkerListener::class,
    ],
    'options' => [
        'log_level' => 5,
        'enable_coroutine' => true,
        'http_compression' => false, // 压缩会缓冲分块，导致 SSE 不实时
    ],
];
```

`SseResponse::run()` 在非协程上下文会抛出 `RuntimeException`，提示开启 `enable_coroutine`。

## 最小示例

### Emitter 回调（推荐）

```php
<?php

declare(strict_types=1);

namespace App\Http\Controller;

use FastD\Http\Response\SseResponse;
use FastD\Http\Sse\EmitterInterface;
use FastD\Http\Sse\Event;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class SseController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $lastId = (int) $request->getHeaderLine('Last-Event-ID');
        $start = max(0, $lastId);

        return new SseResponse(function (EmitterInterface $emitter) use ($start): void {
            $emitter->comment('connected');

            $emitter->send(Event::data([
                'message' => 'stream started',
                'resume_from' => $start,
            ], 'notice'));

            for ($seq = $start + 1; $seq <= $start + 10; $seq++) {
                if ($emitter->isClosed()) {
                    return;
                }

                $emitter->send(Event::data([
                    'seq' => $seq,
                    'time' => date('H:i:s'),
                ], 'tick', (string) $seq));

                self::sleep(1000);
            }

            $emitter->send(Event::data(['message' => 'done'], 'done'));
        }, [
            'heartbeat' => 5,
            'retry' => 3000,
            'max_duration' => 180,
        ]);
    }

    private static function sleep(int $milliseconds): void
    {
        if (class_exists(\Swoole\Coroutine::class) && \Swoole\Coroutine::getCid() > 0) {
            \Swoole\Coroutine::sleep($milliseconds / 1000);

            return;
        }

        usleep($milliseconds * 1000);
    }
}
```

路由：

```php
['GET', '/sse', \App\Http\Controller\SseController::class],
```

也可以用全局辅助函数：

```php
return sse(function (\FastD\Http\Sse\EmitterInterface $emitter): void {
    $emitter->send('hello');
});
```

### 生成器写法

适合事件序列已经确定的短流：

```php
use FastD\Http\Sse\Event;

return sse((function () {
    yield ['tick' => 1];
    yield ['tick' => 2];
    yield Event::data(['message' => 'done'], 'done');
})());
```

### 事件帧格式

```text
id: 1
event: tick
retry: 3000
data: {"seq":1,"time":"12:00:00"}

```

- `event` 为事件名，客户端用 `addEventListener('tick', ...)` 监听；不写时触发默认 `message`。
- `id` 会写入浏览器的 `Last-Event-ID`，断线重连时自动带回。
- `retry` 只影响浏览器的重连间隔，单位毫秒。
- `data` 多行会自动拆成多个 `data:` 行。
- 注释帧（`: ping`）不会触发客户端事件，用于保活。

## 选项

| 选项 | 默认值 | 说明 |
|---|---|---|
| `heartbeat` | `15` | 心跳间隔（秒），`0` 关闭心跳 |
| `max_duration` | `300` | 单条流最长持续时间（秒），`0` 不限制 |
| `retry` | `null` | 初始重连间隔（毫秒） |
| `error_event` | `'error'` | 生产者抛异常时下发的事件名；`null` 关闭 |
| `headers` | `[]` | 追加/覆盖响应头（大小写不敏感） |
| `on_error` | `null` | 生产者异常的记录回调，不影响是否下发错误事件 |

默认响应头：

```text
Content-Type: text/event-stream; charset=UTF-8
Cache-Control: no-cache, no-transform
X-Accel-Buffering: no
```

## Emitter API

| 方法 | 说明 |
|---|---|
| `send(Event\|string\|array $event)` | 发送事件；字符串作为 data，数组 JSON 编码 |
| `comment(string $text)` | 发送注释帧，常用于心跳 |
| `retry(int $milliseconds)` | 下发重连间隔 |
| `isClosed(): bool` | 客户端断开或达到 `max_duration` 时返回 `true` |
| `close()` | 主动结束流 |

生产者应定期检查 `isClosed()`，避免客户端断开后继续拉取上游或写日志。

## 客户端

```html
<script>
const source = new EventSource('/sse');

source.addEventListener('notice', (e) => {
  console.log('notice', e.data, e.lastEventId);
});

source.addEventListener('tick', (e) => {
  console.log('tick', JSON.parse(e.data), e.lastEventId);
});

source.addEventListener('done', (e) => {
  console.log('done', e.data);
  source.close();
});

source.onerror = () => {
  // 浏览器会按 retry 自动重连，并带上 Last-Event-ID
};
</script>
```

命令行验证：

```bash
curl -N 'http://127.0.0.1:9527/sse'
curl -N -H 'Last-Event-ID: 5' 'http://127.0.0.1:9527/sse'
```

`-N` 关闭 curl 自身缓冲，能直接看到逐帧输出。

## CGI / Swoole 差异

| 项目 | CGI / FastCGI | Swoole |
|---|---|---|
| 发送器 | `CgiEmitter`，`echo` + `flush` | `SwooleEmitter`，Channel + `Response::write` |
| 协程要求 | 无 | 必须处于协程上下文 |
| 生产者阻塞时的心跳 | 无法发送心跳 | 独立协程生产，主循环按心跳间隔继续写 `: ping` |
| 断连检测 | `connection_aborted()` | `Response::isWritable()` + 写失败 |
| 超时 | `set_time_limit(0)`，由 FPM/网关限制 | `max_duration`，到点结束响应 |
| 背压 | 输出缓冲 | Channel 容量 64，写失败重试 |
| 结束时收尾 | `close()` | 取消生产者协程、关闭 Channel、`Response::end()` |

CGI 下如果生产者长时间等待上游（例如 AI 接口），期间不会产生心跳，容易被网关判定为空闲连接。需要稳定心跳时使用 Swoole 运行时。

## 注意事项

- **生产者执行晚于中间件**：`SseResponse::send()` / `SwooleEmitter::run()` 在响应返回之后才执行。Session 中间件此时已经保存并下发 Cookie，因此在生产者里修改 Session 不会持久化。需要落库的状态请在返回 `SseResponse` 之前写入。
- **不要在 Swoole 中用 `sleep()`**：会阻塞整个 Worker。使用 `Coroutine::sleep()`，参考示例里的 `sleep()` 辅助方法。
- **压缩与缓冲**：Swoole 关闭 `http_compression`；Nginx 关闭 `proxy_buffering` 与 `gzip`。否则浏览器会一次性收到整段内容。
- **`max_duration` 到期是正常结束**：浏览器可能自动重连，形成循环。长流应在到期前发送 `done` 并让客户端 `close()`，或根据业务续传。
- **异常不会直接抛到外层**：生产者抛出的异常会被转成 `error` 事件（`error_event` 可改），同时调用 `on_error`，然后结束流；不会把异常抛回 `RequestListener` 造成二次响应。
- **`Last-Event-ID` 需要业务实现续传**：框架只负责把请求头交给你，不会自动重放事件。Demo 的 `/sse` 用 `last_id` 查询参数或 `Last-Event-ID` 决定起始序号。
- **跨域**：`EventSource` 默认不带 Cookie；需要 `withCredentials = true` 时，服务端必须返回具体 `Access-Control-Allow-Origin` 与 `Access-Control-Allow-Credentials: true`，见 [CORS](cors.md)。
- **一个连接一条流**：SSE 基于长连接 HTTP 响应，不要在同一响应里混用普通 JSON 输出。
- **代理超时**：即使 `max_duration` 很长，Nginx / 负载均衡仍可能按空闲超时断开；心跳间隔应小于这些超时。

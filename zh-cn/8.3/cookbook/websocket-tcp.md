# WebSocket 与 TCP 服务

适用场景：长连接推送、即时通讯、设备网关、自定义二进制协议。

FastD 的 Swoole 封装本身支持 HTTP / WebSocket / TCP / UDP，但 `config/swoole.php` 只负责装配 HTTP 端口。WebSocket 和 TCP 需要直接构造 `FastD\Swoole\Server`，用独立的入口脚本启动。

## 前置条件

- PHP >= 8.4.1
- `ext-swoole >= 6.0`（不支持 Windows）
- `fastd/swoole`（文档验证版本 8.2.1）与 `fastd/event`
- 只适用于 Swoole 运行时；CGI / PHP-FPM 无法运行常驻的 WebSocket / TCP 服务

监听器与 Server 的组装方式参考 `swoole/examples/server/http.php` 和 `swoole/examples/server/sse.php`。仓库当前没有 WebSocket / TCP 的现成示例，下面的代码沿用同一套 `Server` + `SwooleEventListener` + 事件调度机制。

## `Server::listen()` 的真实签名

```php
public function listen(
    string $host,
    int $port,
    SwooleEventListener $eventListener,
    string $protocol = 'http',
    int $mode = SWOOLE_PROCESS,
    int $sockType = SWOOLE_SOCK_TCP,
): void
```

| 参数 | 说明 |
|---|---|
| `$host` | 监听地址，例如 `127.0.0.1`、`0.0.0.0` |
| `$port` | 端口，同一实例内不能重复 |
| `$eventListener` | **监听器对象实例**，必须是 `FastD\Swoole\Listener\SwooleEventListener` 的子类；不能传类名或闭包 |
| `$protocol` | `http`、`ws`、`udp`、`tcp`；默认 `http` |
| `$mode` | `SWOOLE_PROCESS`（默认）或 `SWOOLE_BASE` |
| `$sockType` | `SWOOLE_SOCK_TCP`（默认）等 Swoole socket 类型 |

协议决定创建哪种原生 Server，以及注册哪些事件：

| `$protocol` | 原生 Server | 主要事件 |
|---|---|---|
| `http` | `Swoole\Http\Server` | `request` + 生命周期事件 |
| `ws` | `Swoole\WebSocket\Server` | `open`、`message`、`disconnect`、`request`、`handShake` |
| `udp` | `Swoole\Server` | `packet`、`receive` |
| `tcp` | `Swoole\Server` | `connect`、`receive`、`close` |

`listen()` 会把监听器注册到事件调度器，并把 `protocol`、`host`、`port` 写到监听器对象上。

### 第一个 `listen()` 决定 Server 类型

`Server::bootstrap()` 只根据**第一个** `listen()` 的 `$protocol` 创建原生 Server：

```php
[$this->swoole, $events] = $this->createSwooleServer(
    $master['protocol'],
    $master['host'],
    $master['port'],
    $master['mode'],
    $master['type'],
);
```

后续端口调用的是 Swoole 原生的 `$this->swoole->listen($host, $port, $type)`，只传 socket 类型。需要同时提供 HTTP、WebSocket、TCP 时，建议**每个协议一个入口脚本、一个 Server 实例**，不要试图在同一个实例里混用协议。

## 为什么 `config/swoole.php` 只能注册 HTTP

`FastD\Server\SwServer` 读取配置时只传三个参数：

```php
foreach ($servers as $name => $server) {
    $listenerClass = $server['listener']
        ?? throw new \RuntimeException(sprintf('Swoole server "%s" requires a listener.', $name));

    $this->server->listen($server['host'], $server['port'], new $listenerClass());
}
```

第三个参数之后全部使用默认值，所以 `$protocol` 永远是 `http`。即使你在 `servers` 里写 `'protocol' => 'ws'`，`SwServer` 也不会读取，原生 Server 仍然是 HTTP Server。

结论：

- `config/swoole.php` 适合注册 HTTP 端口，以及全局的 `listeners`、`options`。
- WebSocket / TCP 要直接 `new \FastD\Swoole\Server(...)`，自行 `listen(..., 'ws')` 或 `listen(..., 'tcp')`。
- 不要修改 `vendor/fastd/fastd` 里的 `SwServer`；升级会覆盖。需要不同的装配逻辑时，复制一份入口脚本放在应用自己的 `bin/` 下。

## WebSocket

### 监听器

事件类为 `FastD\Swoole\Event\Server\MessageEvent`，它同时承载 `open`、`message`、`disconnect` 等事件。推荐直接继承 `SwooleEventListener`，在 `process()` 中按 `$event->event` 分发：

```php
<?php

declare(strict_types=1);

namespace App\Swoole;

use FastD\Swoole\Event\Server\MessageEvent;
use FastD\Swoole\Event\SwooleEvent;
use FastD\Swoole\Listener\SwooleEventListener;
use Swoole\Http\Request;
use Swoole\WebSocket\Frame;
use Swoole\WebSocket\Server;

final class ChatListener extends SwooleEventListener
{
    public function listen(): iterable
    {
        return [
            MessageEvent::class,
        ];
    }

    public function process(object $event): void
    {
        if (!$event instanceof SwooleEvent) {
            return;
        }

        /** @var Server $server */
        $server = $event->object->swoole;

        if ($event->event === 'open') {
            $request = $event->args[1] ?? null;

            if ($request instanceof Request) {
                $server->push($request->fd, $this->encode([
                    'type' => 'welcome',
                    'fd' => $request->fd,
                ]));
            }

            return;
        }

        if ($event->event === 'message') {
            $frame = $event->args[1] ?? null;

            if (!$frame instanceof Frame) {
                return;
            }

            $payload = json_decode($frame->data, true);

            if (!is_array($payload)) {
                $server->push($frame->fd, $this->encode([
                    'type' => 'error',
                    'message' => 'invalid json',
                ]));

                return;
            }

            $server->push($frame->fd, $this->encode([
                'type' => 'echo',
                'data' => $payload,
            ]));

            return;
        }

        if ($event->event === 'disconnect') {
            $fd = (int) ($event->args[1] ?? 0);

            // 连接级状态清理；多 Worker 下需要共享存储，见“注意事项”
        }
    }

    private function encode(array $data): string
    {
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return $json === false ? '{"type":"error","message":"encode failed"}' : $json;
    }
}
```

`$event->args` 与 Swoole 原生回调参数一一对应：

| 事件 | `$event->args` |
|---|---|
| `open` | `[$server, Swoole\Http\Request $request]` |
| `message` | `[$server, Swoole\WebSocket\Frame $frame]` |
| `disconnect` | `[$server, int $fd]` |
| `request` | `[Swoole\Http\Request $request, Swoole\Http\Response $response]` |

`$event->object` 是 `FastD\Swoole\Server`，`$event->object->swoole` 才是原生 `Swoole\WebSocket\Server`。

> 不要直接继承 `FastD\Swoole\Listener\Server\MessageListener`。它声明的抽象方法是 Swoole 原生签名（`onOpen(Server $server, Request $request)`、`onMessage(Server $server, Frame $frame)`），但基类 `ServerEventListener::process()` 只把单个 `SwooleEvent` 传给 `onXxx()`，调用时会抛 `ArgumentCountError`。要么像上面这样继承 `SwooleEventListener`，要么在子类重写 `process()` 自己解包 `$event->args`。

### 入口脚本

`bin/ws-server.php`：

```php
<?php

declare(strict_types=1);

use App\Swoole\ChatListener;
use FastD\Swoole\Listener\Server\WorkerListener;
use FastD\Swoole\Server;

require dirname(__DIR__) . '/vendor/autoload.php';

$server = new Server([
    'worker_num' => 1,
    'pid_file' => dirname(__DIR__) . '/runtime/pid/ws.pid',
    'log_file' => dirname(__DIR__) . '/runtime/logs/ws.log',
    'enable_coroutine' => true,
]);

// 可选：输出 start / workerStart / shutdown 等生命周期日志
$server->addListener(new WorkerListener());

$server->listen('0.0.0.0', 9502, new ChatListener(), 'ws');

$server->start();
```

启动：

```bash
php bin/ws-server.php
```

验证（浏览器控制台）：

```js
const ws = new WebSocket('ws://127.0.0.1:9502');

ws.onmessage = (event) => console.log(event.data);
ws.onopen = () => ws.send(JSON.stringify({ type: 'ping' }));
ws.onclose = () => console.log('closed');
```

也可以用 `websocat` 等命令行客户端验证：

```bash
websocat ws://127.0.0.1:9502
```

### 握手鉴权

`open` 事件拿到的 `Swoole\Http\Request` 包含握手请求信息，可以在推送前校验来源或 token：

```php
if ($event->event === 'open') {
    $request = $event->args[1] ?? null;

    if (!$request instanceof Request) {
        return;
    }

    $token = $request->header['authorization'] ?? '';

    if ($token !== 'Bearer ' . getenv('WS_TOKEN')) {
        $server->close($request->fd);
        return;
    }

    $server->push($request->fd, $this->encode(['type' => 'welcome']));
}
```

- 生产环境不要在 URL query 里放长期密钥；日志、代理都会记录。
- `origin`、`cookie`、`user-agent` 都来自客户端，只能用于辅助判断，不能作为可信身份。
- 关闭连接用 `$server->close($fd)`；推送失败时 `push()` 返回 `false`，说明连接已断开。

## TCP

TCP 使用 `FastD\Swoole\Event\Server\ReceiveEvent`，它承载 `connect`、`receive`、`close`。同样继承 `SwooleEventListener`：

```php
<?php

declare(strict_types=1);

namespace App\Swoole;

use FastD\Swoole\Event\Server\ReceiveEvent;
use FastD\Swoole\Event\SwooleEvent;
use FastD\Swoole\Listener\SwooleEventListener;

final class EchoListener extends SwooleEventListener
{
    public function listen(): iterable
    {
        return [
            ReceiveEvent::class,
        ];
    }

    public function process(object $event): void
    {
        if (!$event instanceof SwooleEvent) {
            return;
        }

        /** @var \Swoole\Server $server */
        $server = $event->object->swoole;

        if ($event->event !== 'receive') {
            return;
        }

        $fd = (int) ($event->args[1] ?? 0);
        $data = trim((string) ($event->args[3] ?? ''));

        if ($data === '') {
            return;
        }

        if ($data === 'PING') {
            $server->send($fd, "PONG\r\n");
            return;
        }

        if ($data === 'QUIT') {
            $server->close($fd);
            return;
        }

        $server->send($fd, 'ECHO ' . $data . "\r\n");
    }
}
```

入口脚本 `bin/tcp-server.php`：

```php
<?php

declare(strict_types=1);

use App\Swoole\EchoListener;
use FastD\Swoole\Server;

require dirname(__DIR__) . '/vendor/autoload.php';

$server = new Server([
    'worker_num' => 1,
    'pid_file' => dirname(__DIR__) . '/runtime/pid/tcp.pid',
    'log_file' => dirname(__DIR__) . '/runtime/logs/tcp.log',
]);

$server->listen('0.0.0.0', 9501, new EchoListener(), 'tcp');

$server->start();
```

验证：

```bash
php bin/tcp-server.php
```

另一个终端：

```bash
printf 'PING\r\n' | nc 127.0.0.1 9501
printf 'hello\r\n' | nc 127.0.0.1 9501
```

预期分别返回 `PONG` 和 `ECHO hello`。

TCP 是字节流，没有消息边界。上面的示例假设客户端按行发送；真实协议要自己定帧（长度前缀、分隔符或固定包头），并在 `receive` 中处理粘包 / 半包。不要假设一次 `receive` 就是一条完整消息。

> 同样不要直接继承 `ReceiveListener` 或 `PacketListener`：它们的抽象方法也是 Swoole 原生多参数签名，与 `process()` 只传一个事件对象的分发方式不匹配。

## 监听器写法约定

| 项目 | 约定 |
|---|---|
| 基类 | 继承 `SwooleEventListener`（需要按事件名自动分发时可用 `ServerEventListener`，但要自己保证方法签名接收 `SwooleEvent`） |
| `listen()` | 返回事件类名数组，例如 `[MessageEvent::class]`、`[ReceiveEvent::class]` |
| `process()` | 接收 `object $event`，实际是 `FastD\Swoole\Event\SwooleEvent` |
| `priority()` | 返回整数，默认 `0`；数值越大越先执行（`SplPriorityQueue`） |
| 事件字段 | `$event->event` 原生事件名、`$event->args` 原生参数、`$event->object` FastD Server |
| 注册 | `listen()` 会自动注册；额外的生命周期监听器用 `addListener()` |

`FastD\Event\ListenerProvider` 按监听器类名去重：同一个类只注册一次。因此多个端口不能复用同一个监听器类，需要为每个端口写一个子类；也不要把一个监听器实例复用到多个端口——`listen()` 会覆盖它的 `host` / `port` / `protocol` 属性。

## 启停与运维

`Server::start()` 会阻塞当前进程。后台运行：

```php
$server->daemon();
$server->start();
```

`daemon()` 必须在 `start()` 之前调用，并且要设置独立的 `pid_file`。`stop()` / `reload()` / `status()` 都依赖 pid 文件：

```php
<?php

declare(strict_types=1);

use FastD\Swoole\Server;

require dirname(__DIR__) . '/vendor/autoload.php';

$server = new Server([
    'pid_file' => dirname(__DIR__) . '/runtime/pid/ws.pid',
]);

$action = $argv[1] ?? 'status';

if ($action === 'stop') {
    $server->stop();
} elseif ($action === 'reload') {
    $server->reload();
} else {
    exit($server->status() ? 0 : 1);
}
```

```bash
php bin/ws-control.php stop
php bin/ws-control.php reload
php bin/ws-control.php status
```

- `stop()` 发送 `SIGTERM`，`reload()` 发送 `SIGUSR1`，`status()` 用信号 `0` 探测进程。
- 多个服务要使用不同的 `pid_file` 和 `log_file`。默认值分别是 `/tmp/swoole.pid`、`/tmp/swoole.log`，共用会互相覆盖，甚至 `stop()` 杀错进程。
- 控制脚本的 `pid_file` 必须与启动脚本完全一致。文件不存在时 `getPid()` 返回 `0`，`stop()` / `status()` 的结果不可信。
- 生产环境建议交给 systemd / supervisor 管理，不要在容器里用 `daemon()`。

## 注意事项

- **协议由入口脚本决定**：`SwServer` 固定按 `http` 注册，`config/swoole.php` 写 `ws` / `tcp` 不会生效。WebSocket / TCP 用独立脚本。
- **多 Worker 的 fd 不共享**：`worker_num > 1` 时，连接分布在不同的 Worker 进程里，`$server->push($fd)` 只能操作当前 Worker 的连接。广播、房间、在线列表要放到 `Swoole\Table`、Redis 或通过 `sendMessage()` 转发；不要用普通数组存连接。
- **协程内不要阻塞**：开启 `enable_coroutine` 后，用 `Swoole\Coroutine::sleep()`，不要用 `sleep()` / 阻塞 cURL，否则整个 Worker 卡住。
- **`disconnect` 不是 `close`**：当前事件表给 WebSocket 注册的是 `disconnect`（Swoole 6），不是 `close`；写错事件名不会报错，只是不会触发。
- **长连接需要应用层心跳**：客户端断开、网络中间设备超时都可能在 TCP 层没有明显通知。自己实现 ping/pong 和空闲超时，及时清理连接状态。
- **消息大小与并发**：大帧、慢客户端会占内存；广播前先判断 `push()` 返回值，避免向已关闭连接写入。
- **追加端口不会传 FastD 协议**：`bootstrap()` 对第二个及之后的端口只调用原生 `listen($host, $port, $sockType)`，FastD 的 `$protocol` 只用于创建首个 Server 和记录端口信息。HTTP、WebSocket、TCP 建议各起一个 `Server` 实例。
- **日志路径要可写**：`runtime/logs/` 不存在或不可写时，Swoole 启动会失败；先创建目录并确认运行用户权限。

## 相关文档

- [组件：fastd/swoole](../components/swoole.md)
- [运行时](../guide/runtime.md)
- [SSE](sse.md)
- [Parallel](parallel.md)
- [Console 与 Process](../guide/console-process.md)
- [已知问题](../reference/known-issues.md)

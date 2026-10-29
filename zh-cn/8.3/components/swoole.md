# fastd/swoole

FastD 8.3 生态中的 Swoole 运行时组件（8.2 版本线），封装 HTTP/TCP/UDP/WebSocket 服务、事件监听、进程与 IPC、协程并发和 SSE 输出。

## 用途与定位

- 基于 Swoole Server 的事件驱动服务封装：`listen()` 注册端口，监听器处理事件
- 提供 `Process` / `Worker` 与三种 IPC（共享内存、消息队列、Socket）
- 提供运行时自适应的并发执行器 `Concurrency\Parallel`
- 为 `SseResponse` 提供 Swoole 专用发送器 `Sse\SwooleEmitter`

框架通过 `FastD\Server\SwServer` 读取 `config/swoole.php` 并组装本组件。

## 安装

```bash
composer require fastd/swoole
```

- Linux（不支持 Windows）
- PHP >= 8.4.1
- `ext-swoole >= 6.0`、`ext-posix`、`ext-sockets`
- 依赖 `fastd/http`、`fastd/event`

## 核心 API / 类

| 类 | 说明 |
|---|---|
| `FastD\Swoole\Server` | 服务入口：`setting()`、`rename()`、`daemon()`、`listen()`、`addListener()`、`start()`、`stop()`、`reload()`、`status()`、`getPid()` |
| `FastD\Swoole\Listener\SwooleEventListener` | 监听器基类：`listen()` 返回事件类名，`process()` 处理，`priority()` 排序 |
| `FastD\Swoole\Listener\Server\ServerEventListener` | 按事件名分发到 `onStart()`、`onWorkerStart()` 等 `onXxx()` 方法 |
| `FastD\Swoole\Listener\Server\RequestListener` | HTTP 监听器基类：实现 `onRequest()`，可覆盖 `onException()` |
| `FastD\Swoole\Event\SwooleEvent` | 事件对象：`event`（原生事件名）、`object`（Server）、`args`（原生回调参数） |
| `FastD\Swoole\Event\Server\ServerEvent` | 服务事件，额外带 `ports`（全部监听端口） |
| `FastD\Swoole\Event\Server\RequestEvent` | HTTP `request` 事件，`args = [$request, $response]` |
| `FastD\Swoole\Process` | 进程管理器：`addWorker()`、`getWorker()`、`getWorkers()`、`addListener()`、`start()` |
| `FastD\Swoole\Process\Worker` | 抽象 Worker：实现 `process(Worker $worker)`；构造参数 `(name, enableCoroutine, communication)` |
| `FastD\Swoole\Process\IPC\Memory` | 基于 `Swoole\Table` 的共享内存 IPC |
| `FastD\Swoole\Process\IPC\Queue` | 基于 `Swoole\Process` 消息队列的 IPC |
| `FastD\Swoole\Process\IPC\Socket` | 基于 `Swoole\Coroutine\Socket` 的 IPC |
| `FastD\Swoole\Concurrency\Parallel` | `Parallel::all($tasks, $timeout)`、`Parallel::each()`、`Parallel::isConcurrent()` |

`Server::listen()` 签名：

```php
listen(
    string $host,
    int $port,
    SwooleEventListener $eventListener,
    string $protocol = 'http', // http | ws | udp | tcp
    int $mode = SWOOLE_PROCESS,
    int $sockType = SWOOLE_SOCK_TCP,
): void
```

## 配置

FastD 8.3 的 `config/swoole.php` 使用 `servers` / `listeners` / `options` 三段结构：

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
        'worker_num' => 2,
        'enable_coroutine' => true,
        'http_compression' => false,
    ],
];
```

- `servers.*.listener` 必须是 `SwooleEventListener` 子类
- `listeners` 是全局事件监听器，由 `SwServer` 逐个 `new` 后注册，不能带构造依赖
- `options` 原样传给 `Swoole\Server::set()`；`SwServer` 会覆盖 `pid_file`、`log_file`、`log_rotation`

直接使用 `Server` 时，常用 setting 包括 `worker_num`、`pid_file`、`log_file`、`daemonize`、`enable_coroutine`。

## 最小示例

HTTP 服务：

```php
use FastD\Http\Response\Json;
use FastD\Swoole\Listener\Server\RequestListener;
use FastD\Swoole\Server;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class HttpListener extends RequestListener
{
    public function onRequest(ServerRequestInterface $request): ResponseInterface
    {
        return new Json(200, [
            'path' => $request->getUri()->getPath(),
            'method' => $request->getMethod(),
        ]);
    }
}

$server = new Server([
    'worker_num' => 2,
    'pid_file' => __DIR__ . '/runtime/pid/http.pid',
]);

$server->listen('127.0.0.1', 9527, new HttpListener(), 'http');
$server->start();
```

协程并发（CGI 下自动串行）：

```php
use FastD\Swoole\Concurrency\Parallel;

$result = Parallel::all([
    'user' => fn () => $userClient->get('/users/1'),
    'orders' => fn () => $orderClient->get('/orders?user_id=1'),
], 0.5);
```

## 注意事项

- `Server::listen()` 的第 4 个参数决定协议；框架 `SwServer` 读取 `servers` 配置时固定按 `http` 注册，因此 `config/swoole.php` 只适合 HTTP 端口。TCP/UDP/WebSocket 需直接构造 `FastD\Swoole\Server`。
- 监听器事件中，`$event->args` 是 Swoole 原生回调参数（如 `request` 为 `[$request, $response]`），`$event->object` 是 Server；`ServerEvent` 额外提供 `$event->ports`。
- `RequestListener` 默认忽略 `/favicon.ico`；`onException()` 默认返回包含 file/line/trace 的 JSON 500，生产环境应覆盖。
- `Process\Worker` 是抽象类，必须继承并实现 `process()`；`Worker` 没有 README 中的 `wait()` 方法，构造参数也不是 `(name, callback, ipc)`。`Worker` 的 `process()` 需自行保持进程存活（如 `Swoole\Event::wait()`）。
- `config/process.php` 的 `worker` 是 `名称 => Worker 类` 映射，`listener` 是信号监听器类列表；框架用 `new $worker($name)`、`new $listener` 实例化，不能带额外构造参数。
- `Swoole\Table` 必须在 worker fork 之前创建；不要在协程中使用阻塞 I/O 或在 worker 间共享可变状态。
- `Server::stop()` / `reload()` / `status()` 依赖 `pid_file`，pid 文件路径要与启动时一致。

## 相关源码 / README

- [fastd/swoole README](https://github.com/fastdlabs/swoole/blob/master/README.md)
- [运行时](../guide/runtime.md)
- [Console 与 Process](../guide/console-process.md)
- [Parallel 并发编排](../cookbook/parallel.md)
- [组件总览](README.md)

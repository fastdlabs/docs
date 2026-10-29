# 运行时

FastD 支持 Swoole 与 CGI / FastCGI 两种主要运行时。

## 启动方式

### Swoole

```bash
php bin/server start
php bin/server status
php bin/server reload
php bin/server stop
```

默认 `127.0.0.1:9527`。

### CGI / FastCGI

```bash
php -S 127.0.0.1:8099 -t web
```

`web/index.php` 创建 `FastD\Server\CgiServer` 并调用 `run()`。

## Swoole 配置

`config/swoole.php` 使用 `servers`、`listeners`、`options`：

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
        'worker_num' => 1,
        'enable_coroutine' => true,
    ],
];
```

一个 `servers` 项对应一个端口监听；`listeners` 对应 Swoole Server 事件监听器；`options` 原样传给 Swoole Server。

## CGI 与 Swoole 差异

| 项目 | CGI / FastCGI | Swoole |
|---|---|---|
| 执行模型 | 每请求启动/复用进程 | 常驻 worker |
| 协程 | 无 | 有 |
| Session 默认 handler | Native File | Swoole Table |
| 共享状态 | 每请求独立 | 进程/表共享，需谨慎 |
| Parallel | 串行 | 协程并发 |

同一份业务代码通过 `Parallel` 自动适配：

```php
use FastD\Swoole\Concurrency\Parallel;

$result = Parallel::all([
    'user' => fn () => $userClient->get('/users/1'),
    'orders' => fn () => $orderClient->get('/orders'),
], 0.5);
```

CGI 串行执行；Swoole 协程并发执行。详见 [Parallel 场景](../cookbook/parallel.md)。

## 协程注意

- 在 Swoole 协程中使用 `Coroutine::sleep()`，不要用会阻塞 worker 的 `sleep()`。
- 不要在协程间共享可变请求状态；请求数据放 `ServerRequest` attributes。
- 使用 `Coroutine\Http\Client` 等协程客户端。
- 阻塞 I/O 会卡住当前 worker。

## 事件与生命周期

- `BootedEvent`、`FinishEvent`、`AbortEvent` 由 `Runtime` 派发。
- Swoole Server 事件由 `listeners` 配置的监听器处理。
- 自定义启动/关闭逻辑优先放在 EventListener/ServiceProvider，不要改框架入口。

组件细节见 [fastd/swoole](../components/swoole.md)。

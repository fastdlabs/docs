# Parallel 并发编排

适用场景：一个接口需要聚合多个上游服务（用户、订单、通知），希望在 Swoole 下并发请求，在 CGI 下保持同一份代码可运行。

`FastD\Swoole\Concurrency\Parallel` 是运行时自适应的执行器：检测到 Swoole 协程上下文时并发执行，否则按顺序串行执行。业务代码不需要写 `if (Swoole)`。

## 前置条件

- PHP >= 8.4.1
- `fastd/swoole >= 8.2`
- 使用 Swoole 运行时：`ext-swoole >= 6.0`，并开启 `enable_coroutine`
- 任务本身是 I/O 型（HTTP、Redis、数据库等），不是 CPU 密集计算

## 配置

`config/swoole.php`：

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
        'worker_num' => 4,
    ],
];
```

`enable_coroutine` 为 `false` 时，`Parallel::isConcurrent()` 返回 `false`，任务退化为串行；不会报错，但也没有并发收益。

## 最小示例

### `Parallel::all()`：聚合结果

```php
<?php

declare(strict_types=1);

namespace App\Http\Controller;

use FastD\Swoole\Concurrency\Parallel;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class DashboardController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $startedAt = microtime(true);

        $result = Parallel::all([
            'user' => fn (): array => $this->fetch('user', 0.08),
            'orders' => fn (): array => $this->fetch('orders', 0.12),
            'notifications' => fn (): array => $this->fetch('notifications', 0.06),
        ], 0.5);

        return json([
            'concurrent' => Parallel::isConcurrent(),
            'elapsed_ms' => round((microtime(true) - $startedAt) * 1000, 2),
            'data' => $result,
        ]);
    }

    /**
     * 真实项目里替换为协程 HTTP 客户端 / Redis / 数据库查询。
     */
    private function fetch(string $service, float $seconds): array
    {
        if (Parallel::isConcurrent()) {
            \Swoole\Coroutine::sleep($seconds);
        } else {
            usleep((int) ($seconds * 1_000_000));
        }

        return [
            'service' => $service,
            'status' => 'ok',
            'delay_ms' => (int) ($seconds * 1000),
        ];
    }
}
```

路由：

```php
['GET', '/dashboard', \App\Http\Controller\DashboardController::class],
```

返回：

```json
{
  "concurrent": true,
  "elapsed_ms": 121.5,
  "data": {
    "user": {"service": "user", "status": "ok", "delay_ms": 80},
    "orders": {"service": "orders", "status": "ok", "delay_ms": 120},
    "notifications": {"service": "notifications", "status": "ok", "delay_ms": 60}
  }
}
```

Swoole 下总耗时接近最慢的任务（约 120ms）；CGI 下是三个任务之和（约 260ms）。

### `Parallel::each()`：完成一个处理一个

适合边聚合边记录日志、边写数据库，或只需要副作用不需要汇总结果的场景：

```php
use FastD\Swoole\Concurrency\Parallel;

Parallel::each(
    [
        'user' => fn (): array => $this->fetch('user', 0.08),
        'orders' => fn (): array => $this->fetch('orders', 0.12),
    ],
    0.5,
    static function (int|string $key, mixed $value): void {
        // 回调在主流程中执行，不在任务协程里
        error_log(sprintf('%s: %s', $key, json_encode($value)));
    }
);
```

带回调时 `each()` 返回空数组；不传回调时与 `all()` 一样返回结果数组。

## API 语义

| 方法 | 说明 |
|---|---|
| `Parallel::all(array $tasks, ?float $timeout = null): array` | 执行全部任务，按输入键返回结果 |
| `Parallel::each(array $tasks, ?float $timeout = null, ?callable $onResult = null): array` | 有回调时逐个消费；无回调时收集结果 |
| `Parallel::isConcurrent(): bool` | 当前是否处于 Swoole 协程上下文 |

规则：

- `$tasks` 的键会保留，`all()` 返回顺序与输入顺序一致，不受完成先后影响。
- 空任务数组直接返回 `[]`。
- `$timeout` 为 `null` 表示不限制；为负数抛 `InvalidArgumentException`；`0` 基本等于立即超时，不建议使用。
- 超时抛 `FastD\Swoole\Concurrency\ParallelTimeoutException`。
- 任意任务抛异常，异常会原样抛给调用方，并取消尚未完成的任务。
- 串行模式的超时只在“任务之间”检查，单个任务自身执行很久仍可能超出总预算；并发模式使用统一 deadline。
- `each()` 的 `$onResult` 在主流程执行，回调抛异常同样会取消剩余任务。

## CGI / Swoole 差异

| 项目 | CGI / FastCGI | Swoole |
|---|---|---|
| 执行方式 | 串行 | 每个任务一个协程 |
| 总耗时 | 各任务之和 | 接近最慢任务 |
| 超时 | 任务之间检查 | `Channel::pop()` 统一 deadline |
| 取消 | 不涉及 | 超时/异常时 `Coroutine::cancel()` |
| I/O 客户端 | 普通同步客户端 | 必须使用协程客户端 |
| `isConcurrent()` | `false` | `true` |

## 命令行的两种运行方式

`fastd/swoole` 源码仓库提供了示例（需先在该仓库执行 `composer install`）：

```bash
cd /path/to/swoole
php examples/concurrency/parallel.php
php examples/concurrency/parallel.php --swoole
```

输出中的 `concurrent` 与 `elapsed_ms` 可以直接对比串行/并发差异。`each.php` 演示逐条回调。

Demo 端点：

```bash
curl http://127.0.0.1:9527/parallel-demo
```

## 注意事项

- **只对 I/O 有效**：协程是单线程调度，CPU 密集任务不会因为 `Parallel` 变快，反而可能因为协程切换增加开销。
- **任务里不要用阻塞客户端**：在 Swoole 协程中使用 `file_get_contents()`、同步 `curl`、`sleep()` 会阻塞整个 Worker，抵消并发收益。使用 `Swoole\Coroutine\Http\Client`，或使用已开启协程 Hook / 连接池的 Redis、PDO 客户端。
- **不要在任务间共享可变状态**：任务应尽量是纯函数，通过返回值汇总；共享对象和全局变量在并发下容易互相污染。
- **控制并发度**：任务数量等于协程数量。一次聚合几十个上游会同时占用连接与内存，必要时分批执行。
- **超时预算要覆盖下游**：`0.5` 秒的总超时意味着所有任务必须在这个预算内完成；单个客户端自身的超时也应小于总预算。
- **异常即失败**：当前实现遇到第一个异常就取消其余任务，不会返回部分成功结果。需要部分成功时，在任务内部捕获异常并返回结构化错误。
- **结果与副作用**：`all()` 在全部完成后才返回；如果希望边完成边处理，用 `each()`。
- **Worker 数量**：并发发生在单个 Worker 内。并发量高时，同时调整 `worker_num` 与下游连接上限。
- **CGI 下仍是串行**：同一份代码可以直接跑，但不要指望 CGI 获得并发加速；需要并发时应部署 Swoole 运行时。

# Console 与 Process

## Console

启动：

```bash
php bin/console list
php bin/console <command>
```

### 注册命令

`config/command.php` 返回命令类列表：

```php
return [
    \App\Command\DemoCommand::class,
];
```

命令继承 Symfony Console：

```php
final class DemoCommand extends Command
{
    protected function configure(): void
    {
        $this->setName('demo:hello');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('hello');
        return Command::SUCCESS;
    }
}
```

FastD Console 通过 `new $command` 实例化，命令类不要依赖容器构造注入；需要容器时在 `execute()` 内使用 `container()`。

## Process

启动：

```bash
php bin/process start
```

### 注册 Worker / Listener

`config/process.php`：

```php
return [
    'worker' => [
        'demo' => \App\Process\DemoWorker::class,
    ],
    'listener' => [
        \App\Listener\Process\DemoSignalListener::class,
    ],
];
```

Worker：

```php
final class DemoWorker extends \FastD\Swoole\Process\Worker
{
    public function process(Worker $worker): void
    {
        \Swoole\Timer::tick(10_000, static function (): void {
            echo 'heartbeat' . PHP_EOL;
        });

        \Swoole\Event::wait();
    }
}
```

### 信号

Listener 继承 `SignalEventListener`，可按需处理进程信号；例如优雅退出时清理资源。

## 注意

- Process 基于 Swoole Process；需要 `ext-swoole`。
- Worker 数量、重启策略、健康检查属于上层调度，不在 Process 组件内。
- Demo 安装后会自动注册 `demo`、`demo-2` Worker 和信号 Listener。

组件细节见 [fastd/swoole](../components/swoole.md)。

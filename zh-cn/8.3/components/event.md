# fastd/event

FastD 8.3 生态中的 PSR-14 事件调度组件（8.0 版本线），支持监听器优先级、停止传播与监听器异常收集。

## 用途与定位

- 实现 `Psr\EventDispatcher\EventDispatcherInterface`
- 事件监听器显式声明自己关心的事件类（`listen()`）
- 监听器按 `priority()` 从高到低执行
- 事件可停止传播；监听器抛出的异常可收集到事件对象
- FastD 的 `BootedEvent`、`FinishEvent`、`AbortEvent` 都基于本组件

## 安装

```bash
composer require fastd/event
```

依赖 `psr/event-dispatcher ^1.0`；PHP >= 8.4.1。

## 核心 API / 类

| 类 / 方法 | 说明 |
|---|---|
| `FastD\Event\EventDispatcher` | `__construct(ListenerProviderInterface $provider)`、`dispatch(object $event): object`、`addListener(...)` |
| `FastD\Event\ListenerProvider` | `addListener(EventListenerInterface ...$listeners)`、`getListenersForEvent(object): iterable` |
| `FastD\Event\EventListener` | 抽象监听器基类；默认 `priority()` 返回 0，需实现 `listen()`、`process()` |
| `FastD\Event\EventListenerInterface` | `listen(): iterable`、`process(object $event): void`、`priority(): int` |
| `FastD\Event\Event` | 可停止/可收集异常的事件基类：`stopPropagation()`、`stopException()`、`getThrowables()` |
| `FastD\Event\ThrowableEventInterface` | `isExceptionStopped()`、`addThrowable()`、`getThrowables()` |
| `FastD\Event\ThrowableListener` | 内部使用：把监听器异常写入事件 |

监听器写法：

```php
final class OrderPaidListener extends \FastD\Event\EventListener
{
    public function listen(): iterable
    {
        return [OrderPaidEvent::class];
    }

    public function process(object $event): void
    {
        // $event 是 OrderPaidEvent
    }

    public function priority(): int
    {
        return 100; // 数值越大越先执行
    }
}
```

## 配置

FastD 应用在 `config/listener.php` 返回监听器类名列表：

```php
return [
    \App\Listener\OrderPaidListener::class,
];
```

框架在 `Application::registerEventListener()` 中用 `new $listener` 实例化并注册到 `EventDispatcher`，随后放入容器服务 `event`。ServiceProvider 也可以追加监听器：

```php
$container->get('event')->addListener($container->make(\App\Listener\OrderPaidListener::class));
```

## 最小示例

```php
use FastD\Event\Event;
use FastD\Event\EventDispatcher;
use FastD\Event\EventListener;
use FastD\Event\ListenerProvider;

final class OrderPaidEvent extends Event
{
    public function __construct(public readonly int $orderId)
    {
    }
}

final class SendReceiptListener extends EventListener
{
    public function listen(): iterable
    {
        return [OrderPaidEvent::class];
    }

    public function process(object $event): void
    {
        echo 'receipt: ' . $event->orderId;
    }
}

$provider = new ListenerProvider();
$provider->addListener(new SendReceiptListener());

$dispatcher = new EventDispatcher($provider);
$event = $dispatcher->dispatch(new OrderPaidEvent(1));
```

停止传播与异常收集：

```php
$event->stopPropagation(); // 后续监听器不再执行
$event->getThrowables();   // [监听器类名 => Throwable]
```

## 注意事项

- 事件按**精确类名**匹配：监听父类或接口不会收到子类事件。当前 `ListenerProvider` 只查 `$event::class`，README 中“继承/接口自动命中”的描述与源码不符。
- 监听器按类名去重：同一个监听器类重复 `addListener()` 只保留第一次的实例。
- 优先级数值越大越先执行，默认 0；相同优先级的先后顺序不保证。
- 监听器异常会被捕获并写入事件的 `getThrowables()`，调度继续；只有事件继承 `FastD\Event\Event`（实现 `ThrowableEventInterface`）才能拿到异常，否则异常被吞掉。
- `stopPropagation()` 会终止剩余监听器；`stopException()` 会在下一轮循环检查时终止（可在监听器中主动调用）。
- `config/listener.php` 中的监听器是无参 `new`，不能声明构造依赖；需要注入时在 ServiceProvider 中用 `$container->make()` 注册。
- 当前源码没有 README 里的 `EventPriority`、`CoroutineEventDispatcher`、`CoroutineSampleListener` 等类，相关章节已过时。
- `Event` 本身没有构造函数，自定义事件可直接添加属性；需要可停止/收集异常时继承它。

## 相关源码 / README

- [fastd/event README](https://github.com/fastdlabs/event/blob/master/README.md)
- [fastd/fastd](fastd.md)
- [运行时](../guide/runtime.md)
- [组件总览](README.md)

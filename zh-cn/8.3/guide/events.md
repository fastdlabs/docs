# 事件与监听器

## 概念与职责

FastD 的事件系统基于 PSR-14，由 `fastd/event` 提供：

| 类 | 职责 |
|---|---|
| `FastD\Event\EventDispatcher` | `dispatch(object $event): object`，按监听器优先级调用 `process()` |
| `FastD\Event\ListenerProvider` | 保存“事件类 → 监听器”映射，按 `$event::class` 精确匹配 |
| `FastD\Event\EventListener` | 抽象基类，默认 `priority()` 返回 0，要求实现 `listen()` 与 `process()` |
| `FastD\Event\Event` | 可停止传播、可收集异常的事件基类 |
| `FastD\Event\ThrowableListener` | 内部使用，把监听器抛出的异常写入事件 |

应用通过 `config/listener.php` 声明监听器，容器服务 `event` 持有当前 dispatcher。

## config/listener.php

文件必须返回类名数组：

```php
<?php

// 命名空间跟随项目 autoload；dobee 默认 "" => src/
return [
    \Listener\RuntimeListener::class,
    \Listener\OrderPaidListener::class,
];
```

注册发生在 `Application::bootstrap()` 的第一步：

```php
$listenerProvider = new ListenerProvider();
foreach ($listeners as $listener) {
    $listenerProvider->addListener(new $listener);
}
$this->add('event', new EventDispatcher($listenerProvider));
```

要点：

- 使用**无参** `new $listener`，构造函数不能有必填参数。需要构造注入时，把监听从这里移到 ServiceProvider，用 `$container->make()` 注册（见下文）。
- 这一步发生在默认服务注册之前，监听器构造函数里拿不到 `logger` / `config` / `matcher`，也不要用 `container()` 取服务。
- 同类监听器按类名去重，重复列出只保留第一次的实例。
- 监听器在启动时全部实例化，构造器应保持轻量，不要做 I/O。
- 若构造函数有必填参数，`new` 会在启动阶段抛 `ArgumentCountError`，且不在 `Runtime::process()` 的 try 内，属于未捕获错误。

## 监听器写法

```php
<?php

declare(strict_types=1);

namespace Listener;

use FastD\Event\EventListener;
use FastD\Event\BootedEvent;

final class RuntimeListener extends EventListener
{
    public function listen(): iterable
    {
        return [BootedEvent::class];
    }

    public function process(object $event): void
    {
        if ($event instanceof BootedEvent) {
            // $event->runtime->environment / $event->runtime->application
        }
    }

    public function priority(): int
    {
        return 100; // 数值越大越先执行，默认 0
    }
}
```

`listen()` 可以返回数组，也可以 `yield` 多个事件类名；同一个监听器可以同时监听多个事件。

## 自定义事件

自定义事件继承 `FastD\Event\Event`，就能使用停止传播与异常收集：

```php
<?php

namespace Event;

use FastD\Event\Event;

final class OrderPaidEvent extends Event
{
    public function __construct(public readonly int $orderId)
    {
    }
}
```

```php
$event = event()->dispatch(new OrderPaidEvent(42));

$event->isPropagationStopped();   // 是否被监听器停止
$event->getThrowables();          // [监听器类名 => Throwable]
```

在 Provider 中注册带依赖的监听器：

```php
$container->get('event')->addListener(
    $container->make(\Listener\SendReceiptListener::class)
);
```

## 实际行为

### 匹配规则

`ListenerProvider::getListenersForEvent()` 只查 `$event::class`：

- 监听父类或接口**不会**收到子类事件。
- 同一个类名的事件才会命中。
- 没有监听器时返回空数组，不报错。

### 执行顺序

监听器被放入 `SplPriorityQueue`，`priority()` 越大越先执行。相同优先级之间的先后顺序没有保证，不要依赖注册顺序。

### 传播控制

`Event::stopPropagation()` 与 `Event::stopException()` 都会在**当前监听器执行完之后**被检查，然后终止剩余监听器。二者区别只是语义：前者表示业务上不再需要后续处理，后者表示异常已处理、不再继续。

```php
public function process(object $event): void
{
    if ($event instanceof OrderPaidEvent && $event->orderId === 0) {
        $event->stopPropagation();
        return;
    }
}
```

`dispatch()` 在开始前也会检查两个标志；如果事件在传入前已停止，直接返回。

### 异常收集

`EventDispatcher` 对每个监听器单独 `try/catch`：

- 捕获到的 `Throwable` 通过 `ThrowableListener` 写入事件的 `getThrowables()`，键是监听器类名。
- 然后继续执行后续监听器，除非事件被停止。
- 只有继承 `FastD\Event\Event`（实现 `ThrowableEventInterface`）的事件才能收集异常；普通对象事件的异常会被吞掉。
- 同一个监听器类重复抛出时，只保留最后一次的 `Throwable`。

### Booted / Finish / Abort

框架事件都只有一个只读属性 `Runtime $runtime`：

| 事件 | 触发时机 |
|---|---|
| `BootedEvent` | 监听器、Provider、路由注册完成之后；Swoole 在 `start()` 之前 |
| `FinishEvent` | `output()` 正常返回后；CGI 每请求，Swoole 整个 server 退出时 |
| `AbortEvent` | `abort()` 执行完、响应已发送/已打印之后 |

```php
use FastD\Event\AbortEvent;
use FastD\Event\BootedEvent;
use FastD\Event\EventListener;
use FastD\Event\FinishEvent;

final class LifecycleListener extends EventListener
{
    public function listen(): iterable
    {
        return [BootedEvent::class, FinishEvent::class, AbortEvent::class];
    }

    public function process(object $event): void
    {
        $runtime = $event->runtime; // FastD\Runtime
        // $runtime->environment, $runtime->application
    }
}
```

时机细节见[生命周期](lifecycle.md)。

### Swoole 下的 dispatcher 差异

`SwServer::bootstrap()` 会把容器中的 `event` 替换为 `FastD\Swoole\SwooleEventDispatcher`。它继承 `EventDispatcher`，但重写了 `dispatch()`：

- 仍然按监听器优先级调用，并收集监听器异常。
- **不会在循环中检查停止标志**，所以 `stopPropagation()` / `stopException()` 无法阻止后续监听器；只有在 dispatch 之前就停止才有效。
- 额外提供 `forward()`，把 Swoole 的 `start`、`request`、`workerStart` 等事件转成事件对象再分发。

`config/swoole.php` 的 `listeners` 是 Swoole Server 生命周期监听器（`SwooleEventListener`），与 `config/listener.php` 的应用监听器不是同一份配置，但共享同一个 `ListenerProvider`。

## 注意事项 / 常见错误

- 不能在 `config/listener.php` 里做构造注入；需要依赖时改用 Provider + `make()`。
- 不要监听父类/接口期望命中子类事件，当前实现是精确类名匹配。
- 监听器实例在启动时创建并复用；不要在属性里保存请求级状态。
- `BootedEvent` 监听器里做阻塞操作会拖慢启动，Swoole 下尤其明显。
- 监听器异常默认不会让启动或请求失败，排查问题要主动检查 `getThrowables()` 或日志。
- `AbortEvent` 的监听器无法改变已经发送的响应；只适合记录、清理、告警。
- 不要手动 `dispatch(new BootedEvent(...))` 来“重新启动”，它不会执行 bootstrap。

## 相关链接

- [fastd/event 组件](../components/event.md)
- [生命周期](lifecycle.md)
- [ServiceProvider](service-provider.md)
- [fastd/swoole](../components/swoole.md)
- [异常与日志](error-logging.md)

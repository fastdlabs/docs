# fastd/fastd

框架核心：应用、运行时、ServiceProvider、测试基类。

## 安装

```bash
composer create-project fastd/dobee my-app
```

或作为库：

```bash
composer require fastd/fastd
```

## 关键类

### Application

- 继承 `FastD\Container\Container`
- 管理 bootstrap、服务、路由、事件
- `bootstrap(runtime)` 初始化应用
- `dispatch(ServerRequestInterface)` 路由分发
- `config('swoole')` 读取配置文件

### Runtime

- `FastD\Server\CgiServer`
- `FastD\Server\SwServer`
- `FastD\Terminal\Console`
- `FastD\Terminal\Process`

Runtime 统一执行：

```text
booted() → process() → output/abort
```

### ServiceProvider

在 `config/service.php` 注册：

```php
return [
    \App\Provider\AppServiceProvider::class,
];
```

实现 `FastD\Container\ServiceProviderInterface::register()`。

## 辅助函数

`fastD/helpers.php` 提供：

- `container()`、`config()`、`event()`、`logger()`
- `json()`、`text()`、`sse()`
- `session()`
- `abort()`
- `forward()`

## 事件

`BootedEvent`、`FinishEvent`、`AbortEvent` 由 Runtime 派发；可在 `config/listener.php` 注册监听器。

## 测试

`FastD\Testing\TestCase` 提供 `handleRequest()` 等断言。

## 注意

- FastD 8.x 要求 PHP >= 8.4.1。
- Swoole 模式依赖 `fastd/swoole` 与 `ext-swoole >= 6.0`。
- 不要在 Controller 中直接 `new` 服务；优先使用容器/构造注入。

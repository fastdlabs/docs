# ServiceProvider

## 概念与职责

ServiceProvider 是 FastD 扩展框架的标准入口。它只做一件事：拿到容器，把服务、中间件、监听器、配置或路由装进去。

```php
namespace FastD\Container;

interface ServiceProviderInterface
{
    public function register(Container $container): void;
}
```

- `FastD\Application` 继承 `Container`，所以 Provider 里拿到的 `$container` 实际就是当前 `Application`，可以用 `config()`、`getRuntime()`、`getRootPath()`（先判断类型）。
- Provider 没有 `boot()`、`unregister()` 或延迟加载机制；`register()` 只在应用 bootstrap 时调用一次。
- 应用通过 `config/service.php` 声明 Provider。

## 注册方式

```php
<?php

// config/service.php
return [
    \Provider\AppServiceProvider::class,
];
```

```php
<?php

declare(strict_types=1);

namespace Provider;

use FastD\Container\Container;
use FastD\Container\ServiceProviderInterface;
use FastD\Application;

final class AppServiceProvider implements ServiceProviderInterface
{
    public function register(Container $container): void
    {
        $container->add('app.name', 'my-app');

        // 以对象形式注册，立即成为共享实例
        $session = $container instanceof Application ? $container->config('session') : [];
        $container->add(AppConfig::class, new AppConfig(
            $session,
            $container->get('logger'),
        ));

        // 需要容器能力的场景，转成 Application
        if ($container instanceof Application) {
            $root = $container->getRootPath();
        }
    }
}
```

`Application::registerServices()` 会 `new $service`，因此 Provider 构造函数不能有必填参数；依赖统一从 `register(Container $container)` 参数获取。

## 注册顺序与实际行为

`Application::bootstrap()` 的固定顺序：

```text
1. 注册 listener → 容器出现 event（EventDispatcher）
2. 注册默认服务 → config（FileParser）、logger、matcher
3. 按 config/service.php 的数组顺序执行 Provider::register()
4. 注册路由（include route）
```

由此得到几个可靠结论：

- Provider 内可以安全使用 `config()`、`logger()`、`event()`、`matcher`。
- Provider 内**还没有加载 `routes` 文件**；如果 Provider 要加路由，直接操作 `$container->get('matcher')->routeCollection`。
- 后执行的 Provider 可以覆盖前面注册的同名服务；对象类型的 `add()` 是直接替换，数组类型会 `array_merge`。
- 容器服务是共享实例；Provider 不要往服务属性里写请求级状态。
- `register()` 没有异常兜底，配置错误会让启动直接失败（这是现有 Provider 的默认策略）。

## 框架与 Demo 中的真实 Provider

### SessionServiceProvider

`FastD\ServiceProvider\SessionServiceProvider` 是 Session 能力的装配者，不是 Session 本身。

```php
public function register(Container $container): void
{
    // 1. 读取 session 配置；读取失败时回退到 root/config/session.php
    // 2. enabled 为空 → 直接返回（默认关闭）
    // 3. handler 支持三个 handler 类名或 auto/swoole_table/native_file/redis 别名
    // 4. 创建 handler（Swoole\Table 必须在 worker fork 前创建）
    // 5. add('session.handler'), add('session.middleware')
    // 6. matcher->push($middleware)
}
```

实际注册的服务 id：

| id | 内容 |
|---|---|
| `session.handler` | `NativeFileSessionHandler` / `SwooleTableSessionHandler` / `RedisSessionHandler` |
| `session.middleware` | 配置好的 `SessionMiddleware` |

`handler = auto` 时按 `$container->getRuntime() === 'swoole'` 选择 Swoole Table 或文件。Redis handler 会在 bootstrap 阶段直接连接，连不上会抛 `InvalidArgumentException`，服务不会带着坏配置启动。除上述三个 handler 类名与四个别名外，其它类名会抛 `Unsupported session handler`。

注意：`config/session.php` 里的 `cookie.lifetime` 目前没有传给 `SessionMiddleware`；中间件始终以 `expire = -1` 发送会话 Cookie（浏览器关闭即失效），服务端过期由 `ttl` 控制。

### CacheServiceProvider

`FastD\Cache\ServiceProvider\CacheServiceProvider`：

- 没有 `config` 服务时抛 `RuntimeException`。
- `$config = $container->config('cache')`，非数组抛 `RuntimeException`。
- `add('cache', new CachePool($config))`。
- 如果 `event` 已存在，追加 `FastD\Cache\Listener\BootedEventListener`；该监听器在 Swoole 运行时调用 `initConnections()`。

### DatabaseServiceProvider

`FastD\MedooDB\ServiceProvider\DatabaseServiceProvider` 与 Cache 同构：

- 读取 `config('database')`，注册 `medoodb` 为 `DatabasePool`。
- 追加 `FastD\MedooDB\Listener\BootedEventListener`，Swoole 启动时预建连接。

### DemoServiceProvider

`FastD\Demo\DemoServiceProvider` 展示了“组合式 Provider”的写法：

```php
public function register(Container $container): void
{
    $this->registerCoreProviders($container); // Session/Cache/MedooDB，带 has() 幂等判断
    $this->registerDemoServices($container); // 绑定 InjectionDemoGreeting
    $this->registerDemoListener($container); // make() 后 addListener
    $this->registerRoutes($container);       // 直接写 matcher->routeCollection
}
```

具体模式：

- `registerCoreProviders()` 先判断 `has('session.middleware')`、`has('cache')`、`has('medoodb')`，再直接调用其它 Provider 的 `register()`，避免重复注册。
- `registerDemoServices()` 把命令类、Worker 类写进 `FileParser::$parsed` 的 `command` / `process`，宿主不需要改 `config/command.php`、`config/process.php`。
- `registerDemoListener()` 用 `$container->make(DemoEventListener::class)` 创建带构造注入的监听器，再 `event()->addListener()`。
- `registerRoutes()` 直接向 `$matcher->routeCollection` 添加路由，并自动补 `OPTIONS` 与 CORS 中间件。

Demo 只在 `fastd/dobee-demo` 安装时存在。`composer install --no-dev` 后，`config/service.php` 中的 Demo 注册应保持 `class_exists()` 保护：

```php
return [
    ...(class_exists(\FastD\Demo\DemoServiceProvider::class)
        ? [\FastD\Demo\DemoServiceProvider::class]
        : []),
];
```

## 扩展代码放哪里

推荐 `src/Provider`：

```text
src/
├── Provider/
│   └── AppServiceProvider.php
├── Http/Controller/
└── Listener/
```

命名空间要跟 `composer.json` 的 autoload 一致：

- dobee 默认 `"" => "src/"`：文件 `src/Provider/AppServiceProvider.php` 对应 `namespace Provider;`。
- 若改成 PSR-4 `"App\\": "src/"`：对应 `namespace App\Provider;`。

注册前确认类能被 Composer 自动加载（必要时 `composer dump-autoload`）。

## 注意事项 / 常见错误

- Provider 构造函数不能有必填参数；`new $service` 不会做依赖注入。
- 不要在 Provider 里读取请求、解析 `$_SERVER` 或做重 I/O；此时没有请求上下文。
- Session 的 `Swoole\Table` 必须在 bootstrap 阶段创建；不要改到请求Middleware 或 worker 回调里创建。
- 依赖可选包时用 `class_exists()` / `interface_exists()` 保护，避免 `--no-dev` 环境启动失败。
- 同名服务后注册会覆盖先注册；覆盖 `logger`、`event` 等框架服务要清楚影响面。
- Provider 中添加路由时，路由仍会在第 4 步之后存在；不要假设 `include route` 已经执行。
- 中间件通过 `matcher->push()` 注册，先 push 的在外层；同一 Provider 被重复执行会重复 push，必要时用 `has()` 或自定义标记做幂等。
- 需要“启动后执行”的逻辑放在 `BootedEvent` 监听器，不要放在 `register()` 里。

## 相关链接

- [fastd/container](../components/container.md)
- [fastd/fastd](../components/fastd.md)
- [事件与监听器](events.md)
- [Session](session.md)
- [缓存](cache.md)
- [数据库](database.md)
- [fastd/dobee-demo](../components/dobee-demo.md)
- [Redis Session 场景](../cookbook/redis-session.md)

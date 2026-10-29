# fastd/container

FastD 8.3 生态中的 PSR-11 依赖注入容器（8.1 版本线），提供构造器注入与 ServiceProvider 机制。

## 用途与定位

- 实现 `Psr\Container\ContainerInterface`（`get()` / `has()`）
- 管理类名、闭包、对象、数组等不同形态的服务
- `make()` 按构造参数类型递归解析依赖，检测循环依赖
- 通过 `ServiceProviderInterface` 组织应用服务注册

FastD 的 `FastD\Application` 直接继承 `Container`，`container()` 助手返回当前应用实例。

## 安装

```bash
composer require fastd/container
```

依赖 `psr/container ^2.0`；PHP >= 8.4.1。

## 核心 API / 类

| 方法 | 说明 |
|---|---|
| `add(string $id, mixed $service)` | 注册服务；支持闭包、对象、类名、数组、可调用对象 |
| `get(string $id, ...$parameters)` | 获取服务，首次解析后缓存；额外参数传给闭包/构造函数 |
| `has(string $id): bool` | 是否已注册 |
| `make(string $class, array $resolving = []): object` | 构造器注入；未注册时递归创建 |
| `register(ServiceProviderInterface $provider)` | 调用 `$provider->register($this)` |
| `clear(string $id)` | 同时删除定义与已解析实例 |
| 数组访问 / 迭代 | `$container['id']`、`isset($container['id'])`、`unset($container['id'])` |

`ServiceProviderInterface`：

```php
interface ServiceProviderInterface
{
    public function register(Container $container): void;
}
```

## 配置

组件没有配置文件。FastD 应用在 `config/service.php` 返回 Provider 类名列表，`Application` 逐个 `new` 后调用 `register()`：

```php
return [
    \App\Provider\AppServiceProvider::class,
];
```

框架默认注册的服务：`config`（`FileParser`）、`logger`（Monolog）、`matcher`（`RouteMatcher`）、`event`（`EventDispatcher`）；Session/Cache/Database 由各自 Provider 追加。

## 最小示例

```php
use FastD\Container\Container;

$container = new Container();

$container->add('app.name', 'fastd');
$container->add('pdo', fn (string $dsn) => new PDO($dsn));
$container->add(\App\Repository\UserRepository::class, \App\Repository\UserRepository::class);

$name = $container->get('app.name');
$pdo = $container->get('pdo', 'sqlite::memory:');

// 构造器注入
$service = $container->make(\App\Service\UserService::class);
```

自动解析的类：

```php
final class UserService
{
    public function __construct(private UserRepository $repository)
    {
    }
}

// UserRepository 未注册且无构造参数时会被自动创建
$service = $container->make(UserService::class);
```

Provider：

```php
use FastD\Container\Container;
use FastD\Container\ServiceProviderInterface;

final class AppServiceProvider implements ServiceProviderInterface
{
    public function register(Container $container): void
    {
        $container->add('app.name', 'my-app');
    }
}

$container->register(new AppServiceProvider());
```

## 注意事项

- `get()` 会把解析结果写入实例缓存，所有服务实际上都是共享单例；第二次 `get()` 传入的参数不会再生效。
- `add('x', SomeClass::class)` 只做 `new SomeClass(...$parameters)`，不会自动注入构造依赖；需要注入请用 `make()` 或注册闭包。
- `make()` 先看 `has($class)`，命中则返回容器中的共享实例；未注册的类每次 `make()` 都会新建。
- `make()` 只解析类类型参数；标量参数没有默认值、也不允许 null 时抛 `RuntimeException`。循环依赖会抛带路径的异常。
- 同一 id 重复 `add()` 数组会与旧数组做 `array_merge`；其他类型直接覆盖。
- 闭包通过 `get($id, ...$parameters)` 接收参数，容器不会自动把自身传进闭包。
- `clear()` 会让服务回到未注册状态，适合测试隔离；`unset($container['id'])` 等价于 `clear()`。
- 在 Provider 中注册的服务立即生效，后续 Provider 可以依赖；控制器通过 `Application` 的 resolver 使用 `make()`。

## 相关源码 / README

- [fastd/container README](https://github.com/fastdlabs/container/blob/master/README.md)
- [项目结构](../guide/project-structure.md)
- [fastd/fastd](fastd.md)
- [组件总览](README.md)

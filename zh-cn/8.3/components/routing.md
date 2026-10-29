# fastd/routing

FastD 8.3 生态中的 PSR-7 / PSR-15 路由器（8.2 版本线），支持静态路由、动态参数、路由组、路由中间件与解析器注入。

## 用途与定位

- 把 `ServerRequestInterface` 匹配到路由，再交给 PSR-15 中间件链处理
- 支持静态路由、`{name}` 动态参数、`{id:[0-9]+}` 约束、可选段、`*` 方法通配
- 路由组共享前缀与中间件
- 通过 resolver 对接容器，实现控制器/中间件构造器注入

框架中 `Application` 持有 `RouteMatcher`（容器服务名 `matcher`），`routes/web.php` 的路由数组最终写入它的 `RouteCollection`。

## 安装

```bash
composer require fastd/routing
```

依赖 `fastd/http`、`fastd/middleware`、PSR-7 / PSR-15 接口；PHP >= 8.4.1。

## 核心 API / 类

| 类 | 说明 |
|---|---|
| `FastD\Routing\Collection\RouteCollection` | 路由集合：`addRoute()`、`get/post/put/patch/delete/options()`、`group()` |
| `FastD\Routing\Collection\Route` | 单条路由：`getMethod()`、`getHandler()`、`getVariables()`、`getParameters()`、`getMiddlewares()` |
| `FastD\Routing\RouteMatcher` | 匹配与派发：`match()` 返回 `MatchedInterface`，`dispatch()` 返回 `ResponseInterface` |
| `FastD\Routing\Matched` | 匹配结果：`getRoute()`、`getServerRequest()` |
| `FastD\Routing\Middleware\RouteMiddleware` | 执行最终路由处理器 |
| `FastD\Routing\Exceptions\RouteNotFoundException` | 路由不存在 |
| `FastD\Routing\Exceptions\RouteException` | 路由注册冲突/语法错误 |
| `FastD\Routing\Exceptions\RouteCallbackException` | 处理器无法解析 |

`addRoute()` 签名：

```php
addRoute(
    string $method,
    string $path,
    mixed $handler,
    array $middleware = [],
    array $parameters = [] // 默认请求属性
): void
```

`RouteMatcher` 构造参数：`(RouteCollection $routeCollection, ?Closure $resolver = null)`。

处理器支持：

- 闭包 / callable / 函数名：`function (ServerRequestInterface $request, RequestHandlerInterface $handler)`
- `Class@method`
- 实现 `MiddlewareInterface` 的类名（直接调用其 `process()`）

## 配置

组件本身没有配置文件。FastD 应用通过 `routes/web.php` 返回路由数组，每个元素依次对应 `addRoute()` 的参数：

```php
return [
    ['GET', '/', \App\Http\Controller\WelcomeController::class],
    ['GET', '/user/{id}', \App\Http\Controller\UserController::class],
    ['GET', '/admin', AdminController::class, [AuthMiddleware::class]],
];
```

需要分组时直接使用 `RouteCollection`；框架的 `matcher->routeCollection` 可在 ServiceProvider 中追加路由。

## 最小示例

```php
use FastD\Http\Request\ServerRequest;
use FastD\Http\Response\Text;
use FastD\Routing\Collection\RouteCollection;
use FastD\Routing\RouteMatcher;

$routes = new RouteCollection();

$routes->get('/user/{id:[0-9]+}', function ($request, $handler) {
    return new Text(200, 'user ' . $request->getAttribute('id'));
}, [\App\Http\Middleware\AuthMiddleware::class]);

$routes->group('/api', function (RouteCollection $routes): void {
    $routes->get('/health', fn () => new Text(200, 'ok'));
});

$matcher = new RouteMatcher($routes);
$response = $matcher->dispatch(new ServerRequest('GET', '/user/1'));
```

接入容器（构造器注入）：

```php
$matcher = new RouteMatcher($routes, fn (string $class) => container()->make($class));
```

## 注意事项

- 同一 `method + path` 重复注册、或先注册动态路由再注册被其匹配的静态路由，都会抛 `RouteException`。
- `{id?}` 不会得到名为 `id` 的属性（`?` 会被当成变量名的一部分）。可选段请用 FastRoute 风格：`/posts[/{id}]`。
- 路由列表中的中间件按定义顺序执行；`group()` 的中间件与路由中间件使用数组并集（`+`）合并，同索引时组中间件优先，混用时不要依赖交错顺序。
- 仅 `Class@method` 形式会调用普通方法；只写类名时，该类必须实现 `MiddlewareInterface`，否则抛 `RouteCallbackException`。
- 匹配到的参数与第 5 个参数（默认属性）会写入请求 attributes；控制器用 `$request->getAttribute('id')` 读取。
- 方法不匹配或路径不存在时抛 `RouteNotFoundException`；`*` 路由会作为兜底。
- `dispatch()` 每次使用独立 `Dispatcher` 和请求副本，可安全用于 Swoole 协程；不要在外部复用它的中间件栈。
- `resolver` 缺省时中间件/控制器用 `new` 实例化，无法注入构造依赖。

## 相关源码 / README

- [fastd/routing README](https://github.com/fastdlabs/routing/blob/master/README.md)
- [路由与控制器](../guide/routing-controller.md)
- [中间件](../guide/middleware.md)
- [组件总览](README.md)

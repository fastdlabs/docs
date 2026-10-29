# 路由与控制器

## 路由文件

`routes/web.php` 返回路由数组：

```php
return [
    ['GET', '/', \App\Http\Controller\WelcomeController::class],
    ['GET', '/user/{id}', \App\Http\Controller\UserController::class],
    ['POST', '/user', \App\Http\Controller\CreateUserController::class],
];
```

每个路由由 `[method, path, handler, middleware?, variables?]` 组成。

## 动态参数

```php
['GET', '/user/{id}', UserController::class]
```

参数会作为请求属性注入：

```php
$id = $request->getAttribute('id');
```

参数约束：

```php
['GET', '/user/{id:[0-9]+}', UserController::class]
```

## Controller

Controller 实现 PSR-15 `MiddlewareInterface`：

```php
final class UserController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return json([
            'id' => $request->getAttribute('id'),
        ]);
    }
}
```

也支持：

- `Class@method`
- callable / Closure
- 普通函数名

### 控制器依赖注入

`Application` 会把容器 resolver 注入 `RouteMatcher`。Controller 和路由中间件通过 `Container::make()` 构造，可声明构造依赖：

```php
final class UserController implements MiddlewareInterface
{
    public function __construct(private UserService $service)
    {
    }
}
```

服务可在 `config/service.php` 的 ServiceProvider 中注册，或直接 `container()->add()` 绑定。

## 路由中间件

```php
[
    'GET',
    '/admin',
    AdminController::class,
    [AuthMiddleware::class, RequestIdMiddleware::class],
]
```

中间件按路由定义顺序执行；返回值必须实现 `ResponseInterface`。

## 路由集合

需要更复杂的分组/资源定义时，可直接使用 `FastD\Routing\Collection\RouteCollection`：

```php
$collection->group('/api/v1', function (RouteCollection $collection): void {
    $collection->get('/users', UserController::class);
});
```

FastD 应用内部通过 `Application` 的 `matcher` 持有 `RouteCollection`。

## 注意

- 方法不匹配/路由不存在会抛出 `RouteNotFoundException`。
- 路由匹配结果以新的请求副本流转，不修改原始 `ServerRequest`。

组件细节见 [fastd/routing](../components/routing.md)。

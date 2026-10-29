# fastd/middleware

FastD 8.3 生态中的 PSR-15 中间件栈（8.0 版本线），负责按顺序执行中间件并生成最终响应。

## 用途与定位

- 基于 `SplStack` 管理 PSR-15 `MiddlewareInterface`
- 提供中间件基类、回调中间件和请求处理器
- 框架用它执行全局中间件、路由中间件与最终控制器

`fastd/routing` 的 `RouteMatcher` 继承 `Dispatcher`；FastD 的全局中间件通过 `matcher->push()` 注册。

## 安装

```bash
composer require fastd/middleware
```

依赖 `fastd/http`、`psr/http-server-middleware`；PHP >= 8.4.1。

## 核心 API / 类

| 类 | 说明 |
|---|---|
| `FastD\Middleware\Dispatcher` | 中间件栈：`push()`、`pop()`、`unshift()`、`shift()`、`dispatch()` |
| `FastD\Middleware\Middleware` | 抽象基类，实现 `MiddlewareInterface` 与 `__invoke()` |
| `FastD\Middleware\CallbackMiddleware` | 用闭包创建中间件：`new CallbackMiddleware(fn ($request, $handler) => ...)` |
| `FastD\Middleware\RequestHandler` | 包装闭包的 `RequestHandlerInterface` 实现，供栈内部使用 |

执行顺序：

```text
push A → push B → push Final
请求：A → B → Final
响应：Final → B → A
```

`dispatch()` 使用 `shift()` 从最早 push 的中间件开始执行，因此 **先 push 的先执行**；`pop()` 移除的是最后 push 的中间件。

## 配置

组件没有配置文件。FastD 中：

- 全局中间件：ServiceProvider 里 `$container->get('matcher')->push($middleware);`
- 路由中间件：`routes/web.php` 每条路由的第 4 个元素
- `SessionServiceProvider`、`ServerRequestCacheProvider` 都通过 `matcher->push()` 装配

## 最小示例

```php
use FastD\Http\Request\ServerRequest;
use FastD\Http\Response\Text;
use FastD\Middleware\CallbackMiddleware;
use FastD\Middleware\Dispatcher;

$requestId = new CallbackMiddleware(function ($request, $handler) {
    $id = $request->getHeaderLine('X-Request-Id') ?: bin2hex(random_bytes(8));
    $response = $handler->handle($request->withAttribute('request_id', $id));

    return $response->withHeader('X-Request-Id', $id);
});

$final = new CallbackMiddleware(fn ($request, $handler) => new Text(200, 'ok'));

$dispatcher = new Dispatcher([$requestId, $final]);
$response = $dispatcher->dispatch(new ServerRequest('GET', '/'));

echo $response->getHeaderLine('X-Request-Id');
```

## 注意事项

- `dispatch()` 成功后会清空整个栈，`Dispatcher` 实际上是一次性的；同一实例再次 `dispatch()` 会因空栈抛 `LogicException`。需要复用时重新 `push()`，并发场景为每个请求新建实例（`RouteMatcher` 即如此）。
- 中间件必须返回 `ResponseInterface`；不调用 `$handler->handle()` 即短路，后续中间件和控制器不会执行。
- 顺序容易记反：`push()` 是入栈，但 `dispatch()` 从 `shift()`（最早入栈）开始，所以调用顺序与 push 顺序一致。
- `pop()` / `shift()` 在空栈上会抛 `SplStack` 的 `RuntimeException`，操作前自行判断。
- 全局中间件先于路由中间件执行：`RouteMatcher` 会克隆全局栈，再 push 路由中间件与最终处理器。
- 中间件里不要保存请求级可变状态到实例属性；Swoole 常驻进程中实例可能被复用。

## 相关源码 / README

- [fastd/middleware README](https://github.com/fastdlabs/middleware/blob/master/README.md)
- [中间件](../guide/middleware.md)
- [路由与控制器](../guide/routing-controller.md)
- [组件总览](README.md)

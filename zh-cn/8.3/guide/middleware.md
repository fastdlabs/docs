# 中间件

FastD 使用 PSR-15 中间件。

## 编写中间件

```php
<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class RequestIdMiddleware implements MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $requestId = $request->getHeaderLine('X-Request-Id')
            ?: bin2hex(random_bytes(8));

        $response = $handler->handle($request->withAttribute('request_id', $requestId));

        return $response->withHeader('X-Request-Id', $requestId);
    }
}
```

## 路由中间件

```php
[
    'GET',
    '/middleware-demo',
    MiddlewareDemoController::class,
    [RequestIdMiddleware::class],
]
```

多个中间件按数组顺序进入，响应阶段反向退出。

## 全局中间件

FastD 没有单独的 `Application::use()` 方法；现有模式是 ServiceProvider 将中间件 push 到容器的 `matcher`：

```php
$container->get('matcher')->push($middleware);
```

`SessionServiceProvider` 和 Cache 的 `ServerRequestCacheProvider` 都采用该方式。

## 短路响应

中间件可以完全不调用 `$handler->handle()`，直接返回响应：

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    if ($request->getMethod() === 'OPTIONS') {
        return text('', 204)->withHeader('Access-Control-Allow-Origin', '*');
    }

    return $handler->handle($request);
}
```

## 注意

- 中间件返回类型必须是 PSR-7 `ResponseInterface`。
- 请求属性（attributes）适合传递请求级数据，不要放长期共享状态。
- Swoole 协程下不要使用会阻塞 worker 的同步调用。

组件细节见 [fastd/middleware](../components/middleware.md)。

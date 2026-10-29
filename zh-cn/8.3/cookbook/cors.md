# CORS

适用场景：前后端分离、CGI 页面调用 Swoole API、浏览器跨域携带 Cookie。

FastD 没有内置 CORS 开关，CORS 是一个普通的 PSR-15 中间件：在响应上追加 `Access-Control-*` 头，并对 `OPTIONS` 预检直接返回 `204`。

## 前置条件

- 已了解[中间件](../guide/middleware.md)与路由中间件
- 浏览器请求会带 `Origin`；跨域携带 Cookie 时还会带 `Access-Control-Request-*`
- 预检请求是独立的 `OPTIONS` 请求，必须有路由能匹配

## 配置

CORS 不需要配置文件，关键是中间件注册位置。

### 路由中间件

`routes/web.php`：

```php
return [
    ['GET', '/cors-demo', \App\Http\Controller\CorsController::class, [\App\Http\Middleware\CorsMiddleware::class]],
    ['OPTIONS', '/cors-demo', \App\Http\Controller\CorsController::class, [\App\Http\Middleware\CorsMiddleware::class]],
];
```

`OPTIONS` 路由不能省略；原因见下文“预检路由”。

### 演示用中间件

`fastd/dobee-demo` 的 `CorsDemoMiddleware`：

```php
final class CorsDemoMiddleware implements MiddlewareInterface
{
    private const HEADERS = [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, X-Demo',
        'Access-Control-Max-Age' => '3600',
    ];

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $request->getMethod() === 'OPTIONS'
            ? new Text(204)
            : $handler->handle($request);

        foreach (self::HEADERS as $name => $value) {
            $response = $response->withHeader($name, $value);
        }

        return $response;
    }
}
```

它适合公开、无凭据的接口。`*` 不能与 `Access-Control-Allow-Credentials: true` 同时使用。

## 最小示例

### 允许指定来源并携带 Cookie

```php
<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class CorsMiddleware implements MiddlewareInterface
{
    private const ALLOWED_ORIGINS = [
        'https://app.example.com',
        'https://admin.example.com',
    ];

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $origin = $request->getHeaderLine('Origin');
        $allowed = $origin !== '' && in_array($origin, self::ALLOWED_ORIGINS, true);

        $response = $request->getMethod() === 'OPTIONS'
            ? text('', 204)
            : $handler->handle($request);

        if (!$allowed) {
            return $response;
        }

        $requestedHeaders = $request->getHeaderLine('Access-Control-Request-Headers');

        return $response
            ->withHeader('Access-Control-Allow-Origin', $origin)
            ->withAddedHeader('Vary', 'Origin')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->withHeader(
                'Access-Control-Allow-Headers',
                $requestedHeaders !== '' ? $requestedHeaders : 'Content-Type, Authorization, X-Requested-With'
            )
            ->withHeader('Access-Control-Max-Age', '600');
    }
}
```

要点：

- 回显具体 `Origin`，不要回 `*`，因为要携带 Cookie。
- 加 `Vary: Origin`，避免 CDN/代理把 A 站点的响应缓存给 B 站点。
- 预检请求不进入业务 Controller，直接 `204`。
- 生产环境建议对 `$requestedHeaders` 做白名单校验，而不是无条件回显。

### Controller

```php
final class CorsController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return json([
            'message' => 'CORS demo',
            'method' => $request->getMethod(),
            'origin' => $request->getHeaderLine('Origin'),
        ]);
    }
}
```

## 预检路由

`RouteMatcher` 先匹配路由，再执行 `matcher` 上 push 的全局中间件，最后执行路由中间件。因此：

```text
OPTIONS /api/orders
  → 如果没有注册 OPTIONS 路由
  → 直接抛 RouteNotFoundException
  → CORS 中间件根本没有机会执行
  → 浏览器看到 404 / 无 CORS 头
```

三种处理方式：

1. 为每个跨域路径显式注册 `OPTIONS` 路由（推荐，权限清晰）。
2. 注册通配方法路由：`['*', '/api/{path:.*}', CorsPreflightController::class, [CorsMiddleware::class]]`，在 Controller 中只处理预检。
3. 由 Nginx/网关统一处理预检。

Demo 的 `DemoServiceProvider` 会自动为每个 Demo 路由补一条 `OPTIONS` 路由，并挂上 `DemoCorsMiddleware`，所以 `/cors-demo` 的预检可以直接工作。

## 验证

预检：

```bash
curl -i -X OPTIONS http://127.0.0.1:9527/cors-demo \
  -H 'Origin: https://demo.example' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: X-Demo'
```

实际请求：

```bash
curl -i http://127.0.0.1:9527/cors-demo \
  -H 'Origin: https://demo.example'
```

应看到：

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Demo
Access-Control-Max-Age: 3600
```

## CGI / Swoole 差异

| 项目 | CGI / FastCGI | Swoole |
|---|---|---|
| CORS 行为 | PSR-15 中间件 | 相同 |
| 预检路由 | 需要注册 `OPTIONS` | 相同 |
| 响应头写出 | `header()` | `Response::header()`，多值头用 `implode(', ')` 合并 |
| 跨域场景 | 通常同源 | 常见：CGI 页面调用 Swoole API（Demo 首页） |

CORS 逻辑本身没有运行时差异；差异主要在部署：

- Swoole 的 `RequestListener::sendHeaders()` 对同名头使用 `implode(', ')`。不要在响应里重复设置多个 `Access-Control-Allow-Origin`。
- 如果 Swoole 前面有 Nginx，确认 Nginx 没有过滤或覆盖 `Access-Control-*` 头。
- CGI 与 Swoole 不同端口时，浏览器按“不同源”处理，必须配置 CORS；Demo 页面通过 `DemoCorsMiddleware` 处理这一点。

## 携带 Cookie

浏览器侧：

```js
fetch('http://127.0.0.1:9527/session', {
  credentials: 'include',
});
```

服务端必须同时满足：

```text
Access-Control-Allow-Origin: https://app.example.com   // 不能是 *
Access-Control-Allow-Credentials: true
```

Session Cookie 还需要：

```php
'cookie' => [
    'secure' => true,
    'same_site' => 'None',
],
```

`SameSite=None` 必须配合 `Secure`，否则浏览器会拒绝写入。相关配置见 [Redis Session](redis-session.md) 与[基础手册 Session](../guide/session.md)。

## 注意事项

- **`*` 与凭据互斥**：`Access-Control-Allow-Origin: *` 加 `Access-Control-Allow-Credentials: true` 会被浏览器拒绝。
- **不要无条件回显 Origin**：回显 + 凭据等于允许任意站点携带用户 Cookie 调用接口。必须使用白名单。
- **错误响应也要带头**：业务异常如果直接抛到框架异常处理，CORS 中间件可能来不及追加头。用异常中间件把异常转成响应（参考 Demo 的 `ExceptionDemoMiddleware`），或在统一异常处理中补 CORS 头。
- **预检不带 Cookie**：预检请求不携带凭据，不要对 `OPTIONS` 做强登录校验；真正的鉴权放在实际请求上。
- **认证中间件顺序**：`CorsMiddleware` 应放在鉴权中间件之前，保证未登录时预检也能返回 CORS 头。
- **`Vary: Origin`**：只要响应头随 Origin 变化，就必须加，否则缓存会串站。
- **`Access-Control-Expose-Headers`**：前端要读取 `Content-Disposition`、`X-Request-Id` 等自定义响应头时，需要显式暴露。
- **私有网络访问**：现代浏览器对 Public → Private 的跨域请求还有 `Access-Control-Request-Private-Network` 预检，需要额外响应头；普通公网 API 不涉及。
- **CORS 不是鉴权**：它只控制浏览器是否允许读取响应，不能替代 Token、Session、签名等认证机制。

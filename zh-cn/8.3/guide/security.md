# 安全

## 概念与职责

框架提供的是安全**原语**，不是安全策略：

- Session 中间件负责会话 ID、Cookie 属性、失效与存储。
- `Session` 提供 CSRF token 的生成、轮换与常量时间校验，但没有内置 CSRF 中间件。
- 上传只提供 PSR-7 的 `UploadedFile`，不提供大小/类型/路径策略。
- CORS 只提供写响应头的能力；Demo 中的 CORS 中间件不能直接用于生产。
- 错误响应默认携带 trace，生产需要自行收敛。

下面按边界逐项说明。

## Session Cookie

`config/session.php` 的 `cookie` 段会传给 `SessionMiddleware`：

| 配置 | 默认值 | 说明 |
|---|---|---|
| `name` | `FASTD_SESSID` | Cookie 名，非法字符会抛异常 |
| `path` | `/` | Cookie 路径 |
| `domain` | `''` | 空表示 host-only |
| `secure` | `false` | HTTPS 环境必须改为 `true` |
| `http_only` | `true` | 禁止 JS 读取 |
| `same_site` | `Lax` | 跨站请求默认不携带 |
| `lifetime` | `0` | **当前未生效**，见下 |

实际行为：

- `SessionMiddleware` 始终以 `expire = -1` 创建 Cookie，即不带 `Expires`，属于会话 Cookie；服务端过期由 `ttl` 控制（写入时刷新，属于滑动过期）。
- 因此 `cookie.lifetime` 目前不会改变 Cookie 生命周期，不要依赖它实现“记住我”。
- Cookie 值为空时 `Cookie::__toString()` 输出删除指令（`deleted` + 过去的过期时间）；`invalidate()` 后中间件正是这样清除客户端 Cookie。
- 会话 ID 必须是 32 位十六进制且存在于存储中；否则生成新 ID。这可以阻止攻击者指定任意会话 ID，但登录后仍应轮换。
- 默认 `secure=false` 是为了本地 HTTP 调试；生产必须开启，否则 Cookie 会随 HTTP 明文发送。

```php
// config/session.php（生产）
'cookie' => [
    'name' => 'FASTD_SESSID',
    'path' => '/',
    'domain' => '',
    'secure' => true,
    'http_only' => true,
    'same_site' => 'Lax',
],
```

跨站需要携带 Cookie 时（如独立前端域名），必须 `same_site => 'None'` 且 `secure => true`，浏览器才会接受。

## CSRF

框架只提供 token API：

```php
$token = $session->getToken();          // 首次访问生成并随会话保存
$valid = $session->isTokenValid($input); // hash_equals 常量时间比较
$new = $session->regenerateToken();      // 主动轮换
```

token 存在会话 payload 的 `__token` 键中，不是一次性 token；校验通过后不会自动失效，需要显式 `regenerateToken()`。

没有内置 CSRF 中间件，需要自己写。推荐只校验“会改变状态”的方法，并优先读请求头：

```php
<?php

declare(strict_types=1);

namespace Http\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class CsrfMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if (in_array($request->getMethod(), ['GET', 'HEAD', 'OPTIONS'], true)) {
            return $handler->handle($request);
        }

        $session = session($request);
        $token = $request->getHeaderLine('X-CSRF-Token');

        if ($token === '') {
            $token = (string) ($request->getParsedBody()['_token'] ?? '');
        }

        if ($session === null || !$session->isTokenValid($token)) {
            return json(['error' => 'invalid csrf token'], 403);
        }

        return $handler->handle($request);
    }
}
```

要点：

- 优先用 `X-CSRF-Token` 头。CGI 的 `fromGlobals()` 只把 `$_POST` 作为 parsed body，JSON body 不会被解析；表单字段只在 form-urlencoded/multipart 下可靠。
- `session($request)` 可能返回 `null`，未启用 Session 时会直接放行或报错，取决于你的判断。
- 登录成功、权限提升、注销重建会话后轮换 token：`$session->regenerateToken()`。
- 退出登录用 `$session->invalidate()`，同时清空数据、删除存储、下发删除 Cookie。
- `SameSite=Lax` 能降低 CSRF 风险，但不能替代 token 校验（尤其是跨站表单提交和 `SameSite=None` 场景）。

## 会话固定与注销

```php
// 登录成功后：保留数据，换新 ID，旧 ID 立即从存储删除
$session->regenerateId();
$session->regenerateToken();

// 注销：清空数据、删除存储，响应携带删除 Cookie
$session->invalidate();
```

实际行为：

- `regenerateId()` 生成新的 32 位十六进制 ID 并销毁旧记录；中间件在响应阶段用新 ID 写 Cookie。
- `invalidate()` 把 `started` 置为 false；之后 `save()` 返回 false，中间件改为发送删除 Cookie。
- `invalidate()` 之后再 `set()` 不会持久化，因为会话已经停止；需要新会话就重新开始请求。
- 不要在未启用 Session 时调用这些方法，`session($request)` 会返回 `null`。

## 文件上传

上传校验必须在应用层完成，框架不会替你判断大小与类型。

```php
$file = $request->getUploadedFiles()['file'] ?? null;

if (!$file instanceof \FastD\Http\Request\UploadedFile || $file->getError() !== UPLOAD_ERR_OK) {
    return json(['error' => 'file is required'], 400);
}

if (($file->getSize() ?? 0) > 2 * 1024 * 1024) {
    return json(['error' => 'file too large'], 413);
}

$tmp = $file->getStream()->getMetadata('uri');
$mime = (new \finfo(FILEINFO_MIME_TYPE))->file((string) $tmp);

$allowed = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'application/pdf' => 'pdf'];
if (!isset($allowed[$mime])) {
    return json(['error' => 'unsupported media type'], 415);
}

$name = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
$target = dirname(__DIR__, 2) . '/runtime/uploads/' . $name; // 绝对路径
$file->moveTo($target);
@chmod($target, 0640);

return json(['saved_as' => $name]);
```

实际行为与限制：

- `getClientMediaType()` 来自客户端，可伪造；服务端要用 `finfo`（需要 `ext-fileinfo`）或 `getimagesize()` 等再次判断。
- `getClientFilename()` 同样不可信；用 `basename()` 去掉路径，并自行生成随机文件名与扩展名，不要沿用客户端扩展名。
- `moveTo()` 拒绝包含 `..` 的目标；目标目录不存在时会创建。
- `moveTo()` 的目录范围检查用 `str_starts_with($targetDir, realpath($targetDir))`，因此**必须传绝对路径**；相对路径会因比较失败抛 `InvalidArgumentException`，指向符号链接目录也可能失败。
- CLI 环境下 `moveTo()` 直接 `rename()`，不做 `is_uploaded_file()` 校验；测试与命令行工具不要依赖它证明“来自上传”。
- 上传目录应放在 Web 根之外，至少禁止 PHP 执行；文件名不要可预测，权限 0640。
- 还需要配合 `php.ini` 的 `upload_max_filesize`、`post_max_size`，Nginx 的 `client_max_body_size`，以及 Swoole 的 `package_max_length`。详见[上传与下载](../cookbook/upload-download.md)。

## CORS 与 Cookie 边界

浏览器规则：

- `Access-Control-Allow-Origin: *` 不能与 `Access-Control-Allow-Credentials: true` 同时使用。
- 携带 Cookie 的跨站请求，必须返回**精确的** Origin，并且前端 `fetch` 设置 `credentials: 'include'`。
- 服务端需要 `Vary: Origin`，避免缓存把 A 站点的响应发给 B 站点。
- 跨站 Cookie 需要 `SameSite=None; Secure`；即便如此，CSRF token 仍然必要。

Demo 的 `FastD\Demo\Middleware\DemoCorsMiddleware` 直接反射请求的 `Origin` 并固定 `Access-Control-Allow-Credentials: true`，这是为了让本地 Demo 页面能访问 Swoole API 的**演示代码**，不能用于生产：任意站点都能带着用户 Cookie 读取响应。

生产应使用允许列表：

```php
$origin = $request->getHeaderLine('Origin');
$allowed = ['https://app.example.com', 'https://admin.example.com'];

$response = $handler->handle($request);

if (in_array($origin, $allowed, true)) {
    $response = $response
        ->withHeader('Access-Control-Allow-Origin', $origin)
        ->withHeader('Access-Control-Allow-Credentials', 'true')
        ->withHeader('Vary', 'Origin');
}
```

预检请求要显式处理 `OPTIONS`，并只允许实际需要的 method/header。

## 密钥与凭据管理

- `.env.yml` 已被 `.gitignore` 忽略，仓库只提交 `.env.yml.example`；不要把真实密码写进示例文件。
- 当前 dobee 的 `.env.yml` 只是 `%var%` 的变量源；配置值不写占位符时它不会生效。部署检查要确认没有残留 `%...%`。
- 框架没有 `env()` 助手；需要系统环境变量时，在 `config/*.php` 里用 `getenv()`，或继续使用 `.env.yml`。
- PHP-FPM 的 `clear_env` 可能清空环境变量，依赖 `getenv()` 时要通过 pool 配置显式传递。
- 配置文件里的数据库、Redis、第三方密钥同样敏感；建议 `.env.yml` 0600、`config/` 0640、`runtime/` 0750。
- 不要把密钥写入日志 context、异常消息或响应体。
- 一旦 `.env.yml` 进入过版本库，应视为泄露并轮换，而不是只删文件。
- Redis Session 默认不加密传输；跨网络部署要启用认证、限制来源，必要时走内网或 TLS。

## 其它加固点

- 生产强制 HTTPS，并为 Cookie 设置 `secure=true`；需要 HSTS 时在 Nginx 或中间件中加 `Strict-Transport-Security`。
- 框架不自动添加安全响应头，建议用全局中间件统一加 `X-Content-Type-Options: nosniff`、`Referrer-Policy`、`Content-Security-Policy` 等。
- 默认错误响应带 trace 与绝对路径，生产务必替换 `abort()` 行为，见[异常与日志](error-logging.md)。
- Session 文件存储为 JSON，新建目录 0700、文件 0600、临时文件 + rename 原子写；不要把 `file.path` 指到 Web 根目录。
- Swoole Table 会话只在单机内存中，不跨节点共享；多实例部署要改用 Redis。
- 上传、缓存、SQLite 等写入目录都不要放在 `web/` 下。
- 开发用的 `php -S` 内置服务器不要用于生产。

## 注意事项 / 常见错误

- 生产仍保留 `secure=false`，Cookie 会随 HTTP 泄露。
- 用 `*` 配合 credentials，或反射任意 Origin，等于允许任意站点读取登录态响应。
- 把 CSRF token 当成一次性 token；它不会自动失效，需要显式轮换。
- 只校验 `getClientMediaType()` 或客户端文件名，导致上传绕过。
- 使用相对路径调用 `moveTo()`，在目录检查处抛异常。
- `invalidate()` 之后继续写 Session，改动不会保存。
- 未判断 `session($request) === null` 就调用方法，导致空指针错误。
- 认为 `SameSite=Lax` 已经足够，忽略 CSRF token。
- 把 `.env.yml` 或含密钥的配置提交进仓库。

## 相关链接

- [Session](session.md)
- [中间件](middleware.md)
- [异常与日志](error-logging.md)
- [上传与下载](../cookbook/upload-download.md)
- [CORS 场景](../cookbook/cors.md)
- [Redis Session 场景](../cookbook/redis-session.md)
- [fastd/http](../components/http.md)

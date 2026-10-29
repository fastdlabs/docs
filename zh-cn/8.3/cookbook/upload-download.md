# 上传与下载

适用场景：表单上传附件、导入 CSV、导出报表、返回生成的文件。

FastD 的上传/下载都基于 PSR-7：上传用 `ServerRequestInterface::getUploadedFiles()`，下载用 `StreamInterface` 作为响应 body。请求与响应的基础 API 见[请求与响应](../guide/request-response.md)。

## 前置条件

- PHP >= 8.4.1
- 可写的 `runtime/` 目录（示例保存到 `runtime/uploads`）
- CGI：`file_uploads=On`，并配置好 `upload_max_filesize`、`post_max_size`
- Swoole：`ext-swoole >= 6.0`，按需调大 `package_max_length`
- 反向代理：按需调大 `client_max_body_size`

## 配置

### CGI / FastCGI

`php.ini`：

```ini
file_uploads = On
upload_max_filesize = 8M
post_max_size = 10M
max_file_uploads = 20
upload_tmp_dir = /var/tmp
```

`post_max_size` 要大于 `upload_max_filesize`，给表单其他字段留出余量。

### Swoole

`config/swoole.php` 的 `options`：

```php
'options' => [
    'package_max_length' => 8 * 1024 * 1024,
    'upload_tmp_dir' => '/var/tmp',
],
```

`package_max_length` 限制整个请求体；上传目录需要 Swoole 运行用户可写。

### 反向代理

```nginx
client_max_body_size 10m;
```

检查 CGI 上传限制：

```bash
php -i | grep -E 'file_uploads|upload_max_filesize|post_max_size|upload_tmp_dir'
```

下载不需要额外配置；响应体大小由运行时内存与代理超时决定。

## 上传

### 最小示例

以下代码基于 `fastd/dobee-demo` 的 `UploadDemoController`，保存路径按应用目录做了调整：

```php
<?php

declare(strict_types=1);

namespace App\Http\Controller;

use FastD\Http\Request\UploadedFile;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class UploadController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $file = $request->getUploadedFiles()['file'] ?? null;

        if (!$file instanceof UploadedFile || $file->getError() !== UPLOAD_ERR_OK) {
            return json(['error' => 'file is required'], 400);
        }

        if ((int) $file->getSize() > 1_048_576) {
            return json(['error' => 'file exceeds 1MB limit'], 413);
        }

        $allowedTypes = ['text/plain', 'text/csv', 'image/png', 'image/jpeg'];
        if (!in_array((string) $file->getClientMediaType(), $allowedTypes, true)) {
            return json(['error' => 'unsupported media type'], 415);
        }

        $clientName = basename((string) $file->getClientFilename());
        $targetName = bin2hex(random_bytes(8)) . '-' . $clientName;
        // src/Http/Controller 往上三层是应用根目录
        $target = dirname(__DIR__, 3) . '/runtime/uploads/' . $targetName;

        $file->moveTo($target);

        return json([
            'name' => $clientName,
            'size' => $file->getSize(),
            'media_type' => $file->getClientMediaType(),
            'saved_as' => $targetName,
        ]);
    }
}
```

路由：

```php
['POST', '/upload', \App\Http\Controller\UploadController::class],
```

请求：

```bash
curl -F 'file=@README.md' http://127.0.0.1:9527/upload
```

多文件上传：

```html
<input type="file" name="files[]" multiple>
```

```php
$files = $request->getUploadedFiles()['files'] ?? [];
```

此时每个元素都是 `UploadedFile`。

### `moveTo()` 的约束

`UploadedFile::moveTo()` 在 `fastd/http` 中有几条硬约束：

- 目标路径不能包含 `..`。
- 目标目录的字符串要与 `realpath()` 结果一致，因此应使用绝对路径，并避免符号链接、相对路径和多余的 `./`；目录不存在时会自动创建。
- `moveTo()` 只能调用一次，第二次抛 `RuntimeException`。
- CGI 下会检查 `is_uploaded_file()`；Swoole 的 `PHP_SAPI` 是 `cli`，走 `rename()`。

因此推荐像示例一样，用 `dirname(__DIR__, 3)` 或应用根路径拼出绝对路径，不要直接把客户端文件名拼进路径。

### 错误码

| 检查 | 建议响应 |
|---|---|
| 字段不存在 / `getError() !== UPLOAD_ERR_OK` | `400` |
| 超过业务大小限制 | `413` |
| 类型不在白名单 | `415` |
| `moveTo()` 抛异常 | `500`，并记录日志 |

`UPLOAD_ERR_INI_SIZE`、`UPLOAD_ERR_FORM_SIZE` 等错误也会体现在 `getError()` 中。生产环境应把具体错误码映射成对用户友好的提示。

## 下载

### 生成 CSV 并下载

以下代码与 `DownloadDemoController` 一致：

```php
<?php

declare(strict_types=1);

namespace App\Http\Controller;

use FastD\Http\Response\Text;
use FastD\Http\Stream\Stream;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class DownloadController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $stream = new Stream('php://temp', 'w+b');
        $stream->write("id,name\n1,fastd\n2,demo\n");
        $stream->rewind();

        return (new Text(200, ''))
            ->withHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->withHeader('Content-Disposition', 'attachment; filename="fastd-demo.csv"')
            ->withBody($stream);
    }
}
```

请求：

```bash
curl -OJ http://127.0.0.1:9527/download
```

### 下载已有文件

```php
use FastD\Http\Response\Text;
use FastD\Http\Stream\Stream;

$path = dirname(__DIR__, 3) . '/storage/report.csv';
$stream = new Stream($path, 'rb');

return (new Text(200, ''))
    ->withHeader('Content-Type', 'text/csv; charset=UTF-8')
    ->withHeader('Content-Disposition', 'attachment; filename="report.csv"')
    ->withHeader('Content-Length', (string) $stream->getSize())
    ->withBody($stream);
```

`Stream` 直接接收文件路径，`getSize()` 来自 `fstat()`。

### 中文文件名

`Content-Disposition` 的 `filename` 只应包含 ASCII 安全字符。中文名使用 RFC 5987 的 `filename*`：

```php
$name = rawurlencode('报表.csv');
$response = $response->withHeader(
    'Content-Disposition',
    sprintf("attachment; filename=\"report.csv\"; filename*=UTF-8''%s", $name)
);
```

不要直接把用户输入拼进响应头，避免 CRLF 注入。

## CGI / Swoole 差异

| 项目 | CGI / FastCGI | Swoole |
|---|---|---|
| 上传大小限制 | `upload_max_filesize`、`post_max_size` | `package_max_length`（默认约 2MB，按需调大） |
| 临时文件 | PHP 上传临时目录 | Swoole 请求临时文件，仅在请求生命周期内有效 |
| 移动方式 | `is_uploaded_file()` + `move_uploaded_file()` | `rename()` |
| `$_FILES` | 由 PHP 填充 | 框架从 `Swoole\Http\Request::$files` 归一化 |
| 下载输出 | `echo` body，受 FPM 内存/超时限制 | `Response::end((string) $body)`，整个 body 进内存 |
| 权限 | Web 服务器用户 | Swoole Worker 用户 |

### Swoole 上传注意事项

- 必须在当前请求内完成 `moveTo()`；请求结束后临时文件可能被清理。
- `package_max_length` 同时限制整个请求体，不只是文件本身；调大后要评估内存占用。
- 反向代理的 `client_max_body_size` 也要同步调大，否则请求到不了 Worker。

### 大文件下载

普通响应不是流式传输：`Text::send()` 会输出完整 body，Swoole 侧会 `(string) $response->getBody()` 把整个文件读进内存。大文件建议：

1. 由 Nginx 直接提供静态文件；
2. 使用 `X-Accel-Redirect` 让 Nginx 内部转发；
3. 使用对象存储预签名 URL；
4. 确实需要应用输出时，分块生成并评估内存上限。

SSE 是独立的流式能力，见 [SSE](sse.md)。

## 注意事项

- **不要信任客户端文件名和 MIME**：`getClientFilename()`、`getClientMediaType()` 都来自客户端。保存时用随机名，类型用 `finfo_file()` 复核。
- **限制大小与数量**：同时限制单文件大小、总请求大小、文件数量；CGI 还要注意 `max_file_uploads`。
- **目录不可执行**：上传目录不要配置 PHP 解析，文件名不要保留可执行扩展名。
- **权限一致**：确保 PHP-FPM / Swoole 运行用户对目标目录有写权限，且上传后的文件能被后续读取。
- **下载鉴权**：下载接口同样要经过认证/授权中间件，不要只靠“文件名猜不到”。
- **CORS 暴露响应头**：前端用 `fetch` 读取文件名时，需要 `Access-Control-Expose-Headers: Content-Disposition`，见 [CORS](cors.md)。
- **Range 请求**：框架默认不处理 `Range`，视频/大文件断点续传应交给 Web 服务器或对象存储。
- **临时文件清理**：业务失败路径也要清理已移动的文件，避免 `runtime/uploads` 无限增长。

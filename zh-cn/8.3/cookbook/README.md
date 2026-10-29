# 场景手册

本手册从可运行的业务场景出发，补齐基础手册没有展开的工程细节。每篇场景页都按同一结构组织：

1. 前置条件
2. 配置
3. 最小示例
4. CGI / Swoole 差异
5. 注意事项

示例代码来自 `fastd/dobee-demo` 的真实控制器、中间件和 `fastd/http`、`fastd/swoole` 的公开 API；示例路由可以直接对照 Demo 端点验证。

## 场景索引

| 场景 | 适用问题 | 关键依赖 | Demo 端点 |
|---|---|---|---|
| [Redis Session](redis-session.md) | 多实例共享会话、会话不落本地磁盘 | `ext-redis`、`fastd/http >= 8.2` | `/session`、`/demo/redis-session.html` |
| [SSE](sse.md) | 实时推送、AI 流式输出、断线续传 | `fastd/http`、Swoole 运行时需开启协程 | `/sse`、`/ai/mock-stream` |
| [Parallel](parallel.md) | 聚合多个上游接口、CGI/Swoole 双运行时 | `fastd/swoole >= 8.2` | `/parallel-demo` |
| [上传与下载](upload-download.md) | multipart 上传、CSV/文件下载 | PSR-7、可写 `runtime/` | `/upload-demo`、`/download-demo` |
| [CORS](cors.md) | 前后端分离、跨域预检、携带 Cookie | PSR-15 | `/cors-demo` |

## 通用前置条件

- PHP >= 8.4.1
- Composer 2.x
- 已通过 `composer create-project fastd/dobee my-app` 或 `composer require fastd/fastd` 准备应用
- 使用 Swoole 运行时还需 `ext-swoole >= 6.0`

Demo 端点需要安装 Demo 包：

```bash
composer require --dev fastd/dobee-demo
```

`fastd/dobee-demo` 的安装脚本会把 `DemoServiceProvider` 注入 `config/service.php`，并自动注册 `/demo/*` 页面与场景路由。生产环境应使用 `--no-dev` 或移除 Demo 包。

## 启动应用

### CGI / FastCGI

```bash
php -S 127.0.0.1:8099 -t web
```

```text
http://127.0.0.1:8099/
http://127.0.0.1:8099/demo/index.html
```

### Swoole

```bash
php bin/server start
```

```text
http://127.0.0.1:9527/
```

停止、重载：

```bash
php bin/server stop
php bin/server reload
```

## 代码放在哪里

场景示例统一使用 PSR-15 Controller：

```php
<?php

declare(strict_types=1);

namespace App\Http\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class ExampleController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return json(['ok' => true]);
    }
}
```

在 `routes/web.php` 注册：

```php
return [
    ['GET', '/example', \App\Http\Controller\ExampleController::class],
];
```

需要请求级中间件时，把类名放在路由第四项：

```php
['GET', '/example', ExampleController::class, [ExampleMiddleware::class]],
```

基础写法见[路由与控制器](../guide/routing-controller.md)和[中间件](../guide/middleware.md)。

## CGI 与 Swoole 的通用差异

| 项目 | CGI / FastCGI | Swoole |
|---|---|---|
| 进程模型 | 每请求独立进程 | 常驻 Worker |
| 协程 | 无 | 需 `enable_coroutine` |
| Session 默认 handler | Native File | Swoole Table |
| 阻塞调用 | 只影响当前请求 | 可能阻塞整个 Worker |
| 代码/配置修改 | 下一次请求生效 | 需要 `reload` 或重启 |
| 长连接/流式响应 | 受 FPM/Web 服务器超时限制 | 受 `max_duration` 与 Worker 配置限制 |

运行时的完整说明见[运行时](../guide/runtime.md)。当前组件版本组合见[兼容性](../reference/compatibility.md)，跨版本迁移见[升级指南](../reference/upgrading.md)，常见故障见[FAQ](../reference/faq.md)。

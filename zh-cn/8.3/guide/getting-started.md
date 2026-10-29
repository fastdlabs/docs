# 快速开始

## 环境要求

- PHP >= 8.4.1
- Composer 2.x
- Swoole >= 6.0（使用 Swoole 运行时时）
- `ext-json`；数据库/缓存按需安装对应扩展

## 创建项目

```bash
composer create-project fastd/dobee my-app
cd my-app
```

`fastd/dobee` 是最小应用骨架，默认包含：

- `config/` 配置
- `routes/web.php` 路由
- `src/` 应用代码
- `web/index.php` FastCGI 入口
- `bin/server`、`bin/console`、`bin/process`

## 启动

### Swoole

```bash
php bin/server start
```

默认监听 `127.0.0.1:9527`。

```bash
curl http://127.0.0.1:9527/
```

停止：

```bash
php bin/server stop
```

### CGI / FastCGI

```bash
php -S 127.0.0.1:8099 -t web
```

```bash
curl http://127.0.0.1:8099/
```

响应中的运行时会以 `[swoole]`、`[fastcgi]` 等形式标记当前运行环境。

## 第一个路由

`routes/web.php`：

```php
<?php

return [
    ['GET', '/hello/{name}', \App\Http\Controller\HelloController::class],
];
```

Controller 是 PSR-15 处理器：

```php
<?php

declare(strict_types=1);

namespace App\Http\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class HelloController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return json([
            'message' => 'hello ' . $request->getAttribute('name'),
        ]);
    }
}
```

访问：

```bash
curl http://127.0.0.1:9527/hello/fastd
```

```json
{"message":"hello fastd"}
```

## 下一步

- [项目结构](project-structure.md)
- [路由与控制器](routing-controller.md)
- [请求与响应](request-response.md)

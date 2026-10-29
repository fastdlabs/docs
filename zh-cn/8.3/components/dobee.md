# fastd/dobee

FastD 8.3 生态中的最小应用骨架（1.4 版本线），安装后即可获得 Swoole 与 FastCGI 双运行时、路由、配置和测试结构。

## 用途与定位

- `composer create-project` 的起点项目，只保留欢迎接口与配置示例
- 默认依赖 `fastd/fastd ^8.3`、`fastd/cache ^8.1`、`fastd/medoodb ^8.0`
- 开发依赖 `fastd/dobee-demo ^1.4.3`（Demo 可选，生产可移除）
- 提供 `bin/server`、`bin/console`、`bin/process`、`web/index.php` 四个入口
- 演示能力全部在 `fastd/dobee-demo` 包中，骨架本身保持最小

## 安装

```bash
composer create-project fastd/dobee my-app
cd my-app
```

- PHP >= 8.4.1、`ext-json`、`ext-pdo`
- Swoole 运行时需要 `ext-swoole >= 6.0`
- 生产安装使用 `composer install --no-dev`，不会引入 Demo

## 核心 API / 类

骨架本身不提供新类，主要组合以下入口：

| 入口 / 文件 | 说明 |
|---|---|
| `web/index.php` | FastCGI 入口：`new CgiServer('fastcgi', new Application(...))->run()` |
| `bin/server` | Swoole 入口，代理到 `fastd/fastd/server`，支持 `start/stop/reload/status` |
| `bin/console` | Console 入口，读取 `config/command.php` |
| `bin/process` | 进程入口，读取 `config/process.php` |
| `src/bootstrap.php` | 返回应用 bootstrap 数组 |
| `routes/web.php` | 返回路由数组 |
| `src/Http/Controller/WelcomeController.php` | 默认控制器，返回带运行时标记的文本 |

项目结构：

```text
config/{cache,database,listener,process,service,session,swoole,command}.php
routes/web.php
src/bootstrap.php
src/Http/Controller/
tests/Feature/
web/index.php
bin/{server,console,process}
```

## 配置

`src/bootstrap.php` 的键与配置文件一一对应：

```php
return [
    'name' => 'fastd8',
    'root' => __DIR__ . '/..',
    'timezone' => 'Asia/Shanghai',
    'log' => ['path' => __DIR__ . '/../runtime/logs', 'level' => \Monolog\Level::Debug],
    'route' => __DIR__ . '/../routes/web.php',
    'service' => __DIR__ . '/../config/service.php',
    'listener' => __DIR__ . '/../config/listener.php',
    'cache' => __DIR__ . '/../config/cache.php',
    'database' => __DIR__ . '/../config/database.php',
    'session' => __DIR__ . '/../config/session.php',
    'command' => __DIR__ . '/../config/command.php',
    'process' => __DIR__ . '/../config/process.php',
    'swoole' => __DIR__ . '/../config/swoole.php',
];
```

启动：

```bash
# Swoole
php bin/server start
php bin/server status
php bin/server reload
php bin/server stop

# FastCGI
php -S 127.0.0.1:8099 -t web
```

## 最小示例

新增路由：

```php
// routes/web.php
return [
    ['GET', '/', \Http\Controller\WelcomeController::class],
    ['GET', '/hello/{name}', \Http\Controller\HelloController::class],
];
```

新增控制器（`src/Http/Controller/HelloController.php`）：

```php
<?php

declare(strict_types=1);

namespace Http\Controller;

use FastD\Http\Response\Json;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class HelloController implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        return new Json(200, ['name' => $request->getAttribute('name')]);
    }
}
```

`routes/web.php` 的每个元素对应 `RouteCollection::addRoute()`：`[method, path, handler, middleware?, variables?]`。

## 注意事项

- 必须在项目根目录执行 `php bin/server` / `php bin/console` / `php bin/process`：`fastd/fastd` 的入口用 `getcwd()` 查找 `src/bootstrap.php`。
- `Application::config()` 依赖 `bootstrap` 中的文件路径；删除或新增配置键时要同步修改 `src/bootstrap.php`，否则抛 `ErrorException`。
- `config/swoole.php` 的 `servers.*.listener` 必须是 Swoole 事件监听器；`SwServer` 按 HTTP 协议注册这些端口，TCP/UDP/WebSocket 请直接使用 `FastD\Swoole\Server`。
- 骨架自动加载是 `"" => src/`，控制器命名空间是 `Http\Controller`（不是 `App\...`）。
- 路由只写类名时，控制器必须实现 `MiddlewareInterface`；否则用 `Class@method`。
- `config/service.php`、`config/command.php`、`config/process.php` 默认返回空数组；命令无参 `new`，Worker 用 `new $worker($name)`，不要依赖框架注入构造参数。
- `runtime/` 下的日志、pid、缓存、Session 目录需要可写；启动时会创建 `runtime/pid` 与日志目录。
- `composer create-project` 默认安装 dev 依赖（含 Demo）；生产环境用 `--no-dev` 或 `composer remove --dev fastd/dobee-demo`。

## 相关源码 / README

- [fastd/dobee README](https://github.com/fastdlabs/dobee/blob/master/README.md)
- [快速开始](../guide/getting-started.md)
- [项目结构](../guide/project-structure.md)
- [运行时](../guide/runtime.md)
- [fastd/dobee-demo](dobee-demo.md)
- [组件总览](README.md)

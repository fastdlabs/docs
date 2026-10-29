# fastd/dobee-demo

FastD `dobee` 的官方 Demo 包（1.4 版本线），提供可运行的接口、页面和运行时对照示例。

## 用途与定位

- 作为 `fastd/dobee` 的开发依赖安装，不进入骨架仓库
- 通过 `DemoServiceProvider` 自动注册 Demo 路由、Session/Cache/Database 服务、事件监听、命令与进程
- 覆盖 HTTP、Cookie、上传下载、Session/CSRF、SSE、缓存、数据库、Swoole、Parallel、CORS、异常等场景
- 提供 `/demo/*.html` 静态演示页与运行时切换脚本

## 安装

```bash
composer require --dev fastd/dobee-demo
```

- PHP >= 8.4.1、`ext-json`、`ext-pdo`
- Swoole 相关 Demo 需要 `ext-swoole >= 6.0`
- SQLite Demo 需要 `ext-pdo_sqlite`
- 依赖 `fastd/fastd`、`fastd/http`、`fastd/swoole`、`fastd/cache`、`fastd/medoodb`、`psr/log`

安装（`post-install-cmd` / `post-update-cmd`）会调用包内 `scripts/install.php`：

- 在 `config/service.php` 的 `return` 数组中注入 `DemoServiceProvider` 的条件注册
- 在 `config/swoole.php` 的 `servers` 中注入 `stats`（9528）与 `demo`（9529）两个监听
- 保留已有配置与注释，重复执行幂等
- 未安装 Demo 时通过 `class_exists()` 自动失效

## 核心 API / 类

| 类 / 文件 | 说明 |
|---|---|
| `FastD\Demo\DemoServiceProvider` | Demo 总装配：核心 Provider、服务、监听器、路由 |
| `FastD\Demo\Routes::all()` | 返回 Demo 路由数组 |
| `FastD\Demo\Controller\PageController` | `/demo/{page}` 静态页面与 `/demo/runtime.js` |
| `FastD\Demo\Middleware\DemoCorsMiddleware` | 统一 CORS / OPTIONS 处理 |
| `FastD\Demo\Middleware\RequestIdMiddleware` | 生成/透传 `X-Request-Id`，记录耗时 |
| `FastD\Demo\Middleware\InjectionDemoMiddleware` | 构造器注入示例 |
| `FastD\Demo\Listener\Server\DemoServerListener` | 9529 端口独立 Swoole 监听 |
| `FastD\Demo\Command\DemoCommand` | `demo:hello` 命令 |
| `FastD\Demo\Process\DemoWorker` | 示例 Worker（`demo`、`demo-2`） |

`DemoServiceProvider` 注册时会：

- 补齐 `SessionServiceProvider`、`CacheServiceProvider`、`DatabaseServiceProvider`
- 把 `DemoCommand` 写入 `command` 配置，把两个 Worker 与信号监听写入 `process` 配置
- 为每条 Demo 路由追加 `DemoCorsMiddleware`，并自动补 `OPTIONS`

## 配置

宿主无需修改 `routes/web.php`。若安装脚本未自动注入，可手动注册：

```php
// config/service.php
if (class_exists(\FastD\Demo\DemoServiceProvider::class)) {
    $providers[] = \FastD\Demo\DemoServiceProvider::class;
}
```

Demo 使用宿主的 `config/session.php`、`config/cache.php`、`config/database.php`、`config/swoole.php`；安装脚本只追加 service 与两个 Swoole 端口。

启动：

```bash
# 页面（推荐 CGI）
php -S 127.0.0.1:8099 -t web

# API / Swoole 模式
php bin/server start
```

打开 `http://127.0.0.1:8099/demo/index.html`。页面固定从 CGI 域名加载 HTML，API 目标可在右侧切换：

| 模式 | API 域名 |
|---|---|
| CGI | 当前页面 URL 域名 |
| Swoole | `config/swoole.php` 中 `servers.http.host` / `port` |

## 最小示例

```bash
# Session
curl -i http://127.0.0.1:9527/session

# 事件
curl http://127.0.0.1:9527/event-demo

# SSE
curl -N 'http://127.0.0.1:9527/sse?limit=5'

# 缓存 / 数据库 / 事务
curl http://127.0.0.1:9527/cache-demo
curl http://127.0.0.1:9527/db-demo
curl http://127.0.0.1:9527/db-transaction-demo

# CORS 预检
curl -i -X OPTIONS http://127.0.0.1:9527/cors-demo \
  -H 'Origin: https://demo.example' \
  -H 'Access-Control-Request-Method: GET'

# 命令与进程
php bin/console demo:hello
php bin/process
```

主要路由：

```text
/session                 /session-security-demo
/di-demo                 /middleware-demo
/sse                     /ai/mock-stream
/cache-demo              /cache-manage-demo
/db-demo                 /db-transaction-demo
/swoole-demo             /parallel-demo
/request-demo            /cookie-demo
/upload-demo             /download-demo
/event-demo              /response-demo
/error-demo              /config-demo
/cors-demo               /demo/{page}
```

## 注意事项

- Demo 路由由 `DemoServiceProvider` 注册，宿主不要重复写进 `routes/web.php`，否则会因路径冲突抛 `RouteException`。
- HTML 页面通过 `PageController` 的白名单读取 `resources/demo/`；新增页面需同时加入白名单。
- `/upload-demo` 限制 1MB，只接受 `text/plain`、`text/csv`、`image/png`、`image/jpeg`，文件写入宿主 `runtime/uploads`。
- `/parallel-demo` 在 CGI 下串行、Swoole 协程下并发；同一段业务代码由 `Parallel` 自动适配。
- 安装脚本会新增 9528（stats）与 9529（demo）端口，启动前确认端口未被占用。
- 生产环境使用 `composer install --no-dev` 或 `composer remove --dev fastd/dobee-demo`；未安装时条件注册自动失效。
- Demo 依赖宿主已安装 Session/Cache/Database 配置；缺失时由其自动补齐 Provider，但 `config/*.php` 仍需存在。
- 需要 Swoole 的页面（SSE、共享内存 Session、Swoole 运行时）在纯 CGI 环境下只能看到串行/文件存储行为。

## 相关源码 / README

- [fastd/dobee-demo README](https://github.com/fastdlabs/dobee-demo/blob/master/README.md)
- [Demo Scenarios](https://github.com/fastdlabs/dobee-demo/blob/master/docs/scenarios.md)
- [Demo 指南](../guide/demo.md)
- [CORS 场景](../cookbook/cors.md)
- [fastd/dobee](dobee.md)
- [组件总览](README.md)

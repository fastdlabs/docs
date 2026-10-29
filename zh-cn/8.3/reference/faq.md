# FAQ

按主题整理 FastD 8.3 使用中的高频问题。每个问题都给出可执行的排查起点。

## 安装与版本

### PHP 8.3 可以运行 FastD 8.3 吗？

不可以。FastD 8.x 要求 **PHP >= 8.4.1**，代码使用了 PHP 8.4 特性。请先升级 PHP，再执行 `composer install`。

### Swoole 5 可以用吗？

不可以。`fastd/swoole` 要求 **Swoole >= 6.0**，并使用 Swoole 6 的 API。用 `php --ri swoole` 确认实际加载版本，而不只是看 `composer.json`。

### 为什么组件版本不是统一的 8.3？

FastD 各组件独立发版：`fastd/http` 是 8.2.1、`fastd/swoole` 是 8.2.1，而 `fastd/cache` 是 8.1.6。版本号只表示各自仓库的发布序列，不代表必须与 fastD 主版本一致。以 `composer show 'fastd/*'` 和仓库 tag 为准，见[兼容性](compatibility.md)。

### 如何创建一个可运行的项目？

```bash
composer create-project fastd/dobee my-app
cd my-app
php -S 127.0.0.1:8099 -t web
```

Swoole：

```bash
php bin/server start
```

详见[快速开始](../guide/getting-started.md)。

## 路由与请求

### 访问路由返回 404 怎么办？

按顺序检查：

1. 方法是否匹配（`GET` / `POST` / `OPTIONS` 是分开注册的）。
2. 路径是否有多余的尾斜杠。
3. 路由是否写在 `routes/web.php`，且 `src/bootstrap.php` 的 `route` 指向它。
4. 动态参数正则是否过严，例如 `{id:[0-9]+}` 不匹配字符串。
5. Swoole 下是否执行过 `php bin/server reload`。

路由匹配失败会抛 `RouteNotFoundException`，异常处理通常返回 404。写法见[路由与控制器](../guide/routing-controller.md)。

### 500 错误去哪里看日志？

默认日志在：

```text
runtime/logs/YYYYMM/{runtime}.log
```

`runtime` 可能是 `fastcgi`、`swoole`、`testcase`。同时检查对应 `YYYYMM` 目录下的 Swoole `error.log`。生产环境不要把完整 trace 返回给客户端。

### 如何读取 JSON 请求体？

优先用：

```php
$body = $request->getParsedBody();
```

FastD 的 `ServerRequest::fromGlobals()` 会解析请求体；Swoole 请求会把原始 body 保留在 `getBody()` 中。需要原始内容时：

```php
$raw = (string) $request->getBody();
```

注意：`getBody()` 只能安全读取一次的场景要先 `rewind()`，或直接使用 `getParsedBody()`。

### 为什么响应里没有我设置的 Header？

- CGI：确认没有在 `header()` 之前输出内容（包括 BOM、`var_dump`、空白行）。
- Swoole：响应头必须在 `Response::end()` 之前设置。
- SSE：流开始后不能再改头。
- 同名多值头在 Swoole 侧会被合并为 `implode(', ')`。

## Session

### Session 完全不生效？

逐项确认：

1. `config/service.php` 是否注册了 `SessionServiceProvider`（使用 Demo 包时已自动注册）。
2. `config/session.php` 的 `enabled` 是否为 `true`。
3. 配置文件是否位于应用根目录的 `config/session.php`。
4. 请求是否带上了 `FASTD_SESSID` Cookie（用 `curl -c` / `-b` 验证）。
5. HTTPS 下 `secure => true`，HTTP 调试时不要开启。
6. 跨站请求时 `SameSite` 是否允许携带 Cookie。

### Session 数据写进去了，但下一次请求读不到？

常见原因：

- 单会话 JSON 超过大小上限（Swoole Table / Redis 读取 `swoole_table.max_data_size`，默认 4096 字节），`write()` 返回 `false`。
- Cookie 没有回传，或域名/路径不匹配。
- Swoole 使用了 Swoole Table，进程重启后内存数据丢失。
- 在 SSE 生产者里写 Session（响应已返回，中间件已保存，写入不会持久化）。
- 并发请求互相覆盖。

### Session 存在哪里？

看 `handler`：

| 配置 | 存储 |
|---|---|
| `auto` | Swoole Table（Swoole）/ 文件（CGI） |
| `native_file` | `file.path`，未配置时退回 `session_save_path()` 或系统临时目录 |
| `swoole_table` | 共享内存，进程重启丢失 |
| `RedisSessionHandler::class` | Redis，按 TTL 过期 |

文件 Session 的目录、Swoole Table 的 `size`/`max_data_size`、Redis 的 `prefix` 都在 `config/session.php` 中配置。

### 登录后需要换 Session ID 吗？

需要。登录成功后调用：

```php
$session->regenerateId();
$session->regenerateToken();
```

防止会话固定攻击。退出时调用 `$session->invalidate()`。见 [Redis Session](../cookbook/redis-session.md)。

### 为什么不能用 `session_start()` / `$_SESSION`？

FastD 的 Session 是 PSR-15 中间件 + 自定义 handler，不读写 PHP 原生 Session。Swoole 常驻进程下原生 Session 的生命周期与请求不一致，容易产生串会话。统一使用 `$request->getAttribute(SessionMiddleware::ATTRIBUTE)` 或 `session($request)`。

### Redis Session 启动时报连接失败？

检查：

```bash
php -m | grep redis
redis-cli -h 127.0.0.1 -p 6379 ping
```

再核对 `password`、`database`、`timeout`。Provider 在启动阶段连接 Redis，失败会直接抛异常，不会降级为文件 Session。Swoole 多 Worker 的连接共享风险见[Redis Session](../cookbook/redis-session.md)。

## SSE

### `curl` 一次性收到全部内容，不是逐条输出？

依次检查：

- 使用 `curl -N` 关闭 curl 缓冲。
- Nginx 配置 `proxy_buffering off;`、`gzip off;`。
- Swoole 配置 `'http_compression' => false`。
- 中间是否有 CDN、网关或 APM 在缓冲响应。
- 生产者是否在循环结束后才发送（例如先收集到数组再 `yield`）。

### Swoole 下报 “requires a coroutine context”？

在 `config/swoole.php` 的 `options` 中设置：

```php
'enable_coroutine' => true,
```

`SwooleEmitter` 必须在协程中运行，否则直接抛 `RuntimeException`。

### SSE 连接大约 300 秒后断开？

默认 `max_duration` 是 300 秒。按业务设置：

```php
new SseResponse($producer, [
    'max_duration' => 1800,
    'heartbeat' => 10,
]);
```

设为 `0` 表示不限制，但代理、负载均衡和浏览器仍可能按空闲时间断开。心跳间隔要小于这些超时。

### CGI 下长时间等待上游时没有心跳？

`CgiEmitter` 只能在生产者让出时写数据，生产者阻塞期间无法发送心跳。需要稳定心跳、AI 逐字输出等场景应使用 Swoole 运行时。见 [SSE](../cookbook/sse.md)。

### 在 SSE 生产者里修改 Session 为什么不生效？

SSE 的实际发送发生在中间件链之后：`SessionMiddleware` 已经保存 Session 并下发 Cookie，`SseResponse::send()` / `SwooleEmitter::run()` 才开始执行生产者。需要持久化的数据必须在返回 `SseResponse` 之前写入。

### `EventSource` 跨域失败？

- 服务端返回具体 `Access-Control-Allow-Origin`，不能是 `*`（携带凭据时）。
- 需要 `Access-Control-Allow-Credentials: true`。
- 前端设置 `source.withCredentials = true`。
- Session Cookie 设置 `SameSite=None; Secure`。

见 [CORS](../cookbook/cors.md)。

## Parallel

### `Parallel::isConcurrent()` 返回 false？

只有同时满足以下条件才为 `true`：

- 已加载 `ext-swoole`
- 当前处于协程上下文（`Coroutine::getCid() > 0`）
- Swoole 服务开启 `enable_coroutine`

CGI 下永远是串行，这是设计行为，不是故障。

### `Parallel` 超时后抛什么异常？

抛 `FastD\Swoole\Concurrency\ParallelTimeoutException`。并发模式会取消剩余协程；串行模式只在任务之间检查超时，单个任务仍可能超预算。`timeout` 为 `null` 表示不限制，`0` 基本等于立即超时。

### 为什么用了 Parallel 反而更慢？

- 任务是 CPU 密集型，协程不能并行利用多核。
- 任务里用了阻塞客户端（同步 curl、`file_get_contents`、`sleep()`），阻塞了 Worker。
- 任务数量太多，协程创建和连接开销超过收益。
- 下游服务本身有限流或连接数瓶颈。

Parallel 适合 I/O 型、可独立执行的任务，见 [Parallel](../cookbook/parallel.md)。

### 某个任务失败会怎样？

异常会原样抛给调用方，其余未完成任务被取消；`all()` 不会返回部分结果。需要部分成功时，在任务内部捕获异常并返回结构化错误。

## 上传与下载

### 上传返回 413，或 `$_FILES` / `getUploadedFiles()` 为空？

- CGI：调大 `upload_max_filesize`、`post_max_size`，并确认 `file_uploads=On`。
- Nginx：调大 `client_max_body_size`。
- Swoole：调大 `package_max_length`（默认约 2MB）。
- 请求体超过 `post_max_size` 时，PHP 可能直接丢弃 `$_FILES`，表现为“没有文件”而不是明确报错。

### `moveTo()` 抛 `InvalidArgumentException`？

检查目标路径：

- 使用绝对路径，且目录字符串要与 `realpath()` 结果一致，避免符号链接、相对路径和多余的 `./`。
- 不能包含 `..`。
- 目标目录要可写。
- 同一个 `UploadedFile` 不能 `moveTo()` 两次。

### 下载的文件损坏或打不开？

- 确认响应头之前没有任何输出。
- `Content-Length` 必须与实际 body 长度一致。
- CSV 用 `text/csv; charset=UTF-8`；需要 Excel 识别中文时加 UTF-8 BOM。
- 不要在 `Content-Disposition` 中直接拼用户输入。
- Swoole 下确认没有中间件或代理改写 `Content-Type`、`Content-Disposition`。

### 大文件下载占用内存过高？

普通响应会把整个 body 读入内存（Swoole 侧是 `(string) $response->getBody()`）。大文件交给 Nginx 静态服务、`X-Accel-Redirect` 或对象存储预签名 URL。见[上传与下载](../cookbook/upload-download.md)。

## CORS

### `OPTIONS` 预检返回 404？

FastD 先匹配路由再执行全局中间件；没有 `OPTIONS` 路由时，CORS 中间件没有机会运行。为跨域路径显式注册：

```php
['OPTIONS', '/api/orders', OrderController::class, [CorsMiddleware::class]],
```

或在网关统一处理预检。见 [CORS](../cookbook/cors.md)。

### 携带 Cookie 时浏览器拒绝响应？

`Access-Control-Allow-Origin: *` 不能与 `Access-Control-Allow-Credentials: true` 同时使用。必须回显白名单中的具体 Origin，并加 `Vary: Origin`。前端还要设置 `credentials: 'include'`。

### 错误响应没有 CORS 头？

未捕获异常会绕过 CORS 中间件。用异常中间件把异常转换为响应，或在统一异常处理里补 CORS 头；同时确保 CORS 中间件位于鉴权中间件之前。

## 部署与运行时

### 改了代码，Swoole 没生效？

```bash
php bin/server reload
```

配置或启动项变更建议 `stop` 后 `start`。CGI 下检查 OPcache 是否缓存了旧文件。

### Swoole 重启后 Session 全没了？

如果 `handler` 是 `auto` 或 `swoole_table`，Session 存在共享内存，进程重启即丢失。需要持久化时改用 Redis，见 [Redis Session](../cookbook/redis-session.md)。

### 如何确认当前运行在 CGI 还是 Swoole？

Demo 首页/接口会返回运行时信息；也可以检查 `Application::getRuntime()` 或响应中的 `[swoole]` / `[fastcgi]` 标记。请求级逻辑不要依赖全局可变状态。

### 生产环境需要关闭什么？

- `composer install --no-dev`，不安装 `require-dev` 中的 `fastd/dobee-demo` 等包。
- 关闭详细异常输出，保留日志。
- Session Cookie 设置 `secure`，按需 `SameSite`。
- CORS 使用来源白名单，不使用 `*` + 凭据。
- 上传目录禁止 PHP 执行，限制大小与类型。
- 不要把 `.env.yml`、数据库密码、Redis 密码提交到仓库。

更多版本信息见[兼容性](compatibility.md)，升级步骤见[升级指南](upgrading.md)。

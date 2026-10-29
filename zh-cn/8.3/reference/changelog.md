# 变更记录（8.3 / 8.2 / 8.1）

本页是 8.x 版本线的变化导读，不是发布公告。FastD 生态由多个独立仓库组成，补丁版本会继续发布，**实际可用版本以 `composer.lock` / `composer show` 与各仓库 Git tag 为准**。

- 升级操作与回滚：见[升级指南](upgrading.md)
- 文档验证过的版本组合：见[兼容性](compatibility.md)
- 已知缺陷与规避：见[已知问题](known-issues.md)

各组件的权威升级说明：

| 仓库 | 文档 | 覆盖内容 |
|---|---|---|
| fastD | <https://github.com/fastdlabs/fastD/blob/master/UPGRADING.md> | 框架版本、Swoole 配置结构、兼容矩阵 |
| dobee | <https://github.com/fastdlabs/dobee/blob/master/UPGRADING.md> | 骨架依赖约束、Demo 拆分 |
| dobee-demo | <https://github.com/fastdlabs/dobee-demo/blob/master/UPGRADING.md> | Demo 包配置注入、安装脚本行为 |

如果本页与仓库 `UPGRADING.md` 或实际 tag 不一致，以后者为准。

## 版本线速览

| 版本线 | 代表 tag | PHP | 核心变化 |
|---|---|---|---|
| 8.3 | `fastd/fastd v8.3.1`、`fastd/http v8.2.1`、`fastd/swoole v8.2.1` | >= 8.4.1 | Redis Session 接入 `SessionServiceProvider`；`handler` 支持类名与别名；`fastd/http` 最低约束提高到 `^8.2` |
| 8.2 | `fastd/fastd v8.2.0`、`fastd/http v8.2.0`、`fastd/swoole v8.2.0` | >= 8.4.1 | Swoole 配置改为 `servers` / `listeners` / `options`；新增 `Parallel`；`fastd/http` 新增 `RedisSessionHandler` |
| 8.1 | `fastd/fastd v8.1.0`、`fastd/http v8.1.0`、`fastd/swoole v8.1.0` | >= 8.2 | Session 与 SSE（`SseResponse`、`CgiEmitter`、`SwooleEmitter`、`sse()`） |

注意：

- 组件版本号不要求统一。`fastd/fastd 8.3.x` 可以搭配 `fastd/http 8.2.x`、`fastd/swoole 8.2.x`。
- 8.2 起 PHP 最低版本从 8.2 提高到 **8.4.1**，这是环境层面的破坏性变化。
- 8.0.x 是 8.x 的第一个版本线，PSR-7 / PSR-15 / PSR-18 的基础结构在 8.1 之前已经成形；本页只列 8.1 之后的主要变化。

## 8.3

`fastd/fastd 8.3` 没有破坏性的配置结构变更，主要工作是把 Redis Session 接进框架，并收紧依赖约束。

### Session

- `SessionServiceProvider` 支持把 `config/session.php` 的 `handler` 写成：
  - 别名：`auto`、`swoole_table`、`native_file`、`redis`；
  - 类名：当前只支持 `SwooleTableSessionHandler::class`、`NativeFileSessionHandler::class`、`RedisSessionHandler::class`。写其它类名会抛 `InvalidArgumentException`（`Unsupported session handler "..."`），不是“任意实现 `SessionHandlerInterface` 的类都能接入”。
- `auto` 在 Swoole 运行时选择 Swoole Table，在 CGI / FastCGI 选择文件；`auto` **不会**选择 Redis。
- 新增 `config/session.php` 的 `redis` 段：`host`、`port`、`timeout`、`password`、`database`、`prefix`，由 Provider 用来创建 `\Redis` 连接。
- Redis 连接在应用 `bootstrap` 阶段建立；Swoole 下这发生在 Worker fork 之前，多 Worker 场景需要注意连接共享，见[已知问题](known-issues.md)。

配置示例与完整用法见 [Redis Session](../cookbook/redis-session.md)。

### 依赖约束

- `fastd/fastd 8.3.1` 要求 `fastd/http ^8.2`、`fastd/swoole ^8.1`、`fastd/container ^8.1`。
- `fastd/fastd 8.3.0` 的 `fastd/http` 约束仍是 `^8.1`，8.3.1 才提高到 `^8.2`；如果 `composer.lock` 里还是 `fastd/http 8.1.x`，本次更新必须同时升级 `fastd/http`，否则 8.3.1 的约束无法满足。
- `RedisSessionHandler` 由 `fastd/http 8.2` 提供，所以 8.3 的 Redis Session 依赖 `fastd/http >= 8.2`。

### 升级

```bash
composer update "fastd/*" --with-dependencies
composer show 'fastd/*'
```

8.2 → 8.3 不需要迁移 Swoole 配置；完整检查项见[升级指南](upgrading.md)。

## 8.2

8.2 是 8.x 中变化最大的一次，包含 Swoole 配置结构重写、PHP 版本要求提高，以及新的并发与 Session 能力。

### Swoole 配置结构

旧结构整体废弃，**不保留兼容层**：

| 8.1 | 8.2 起 |
|---|---|
| `listen` | `servers` |
| `listen[].worker` | `servers.<name>.listener` |
| `listener` | `listeners` |
| `setting` | `options` |

旧配置：

```php
return [
    'listen' => [
        [
            'host' => '127.0.0.1',
            'port' => 9527,
            'worker' => \FastD\Listener\Server\SwHttpListener::class,
        ],
    ],
    'listener' => [
        \FastD\Swoole\Listener\Server\WorkerListener::class,
    ],
    'setting' => [
        'log_level' => 5,
    ],
];
```

新配置：

```php
return [
    'servers' => [
        'http' => [
            'host' => '127.0.0.1',
            'port' => 9527,
            'listener' => \FastD\Listener\Server\SwHttpListener::class,
        ],
    ],
    'listeners' => [
        \FastD\Swoole\Listener\Server\WorkerListener::class,
    ],
    'options' => [
        'log_level' => 5,
    ],
];
```

- 仍然使用 `listen` / `listener` / `setting` 时，`servers` 为空，`SwServer` 不会注册任何端口，启动会报 `No listen port configured.`；如果 `servers` 条目缺少 `listener`，则报 `Swoole server "..." requires a listener`。
- `servers` 的每个条目必须有 `listener`；`SwServer` 只传 `host`、`port` 和监听器实例，协议固定为 `http`。WebSocket / TCP 的注册方式见 [WebSocket 与 TCP](../cookbook/websocket-tcp.md)。
- `options` 原样传给 `Swoole\Server::set()`；框架会覆盖 `pid_file`、`log_file`、`log_rotation`。

### Session

- `fastd/http 8.2` 新增 `FastD\Http\Session\Handler\RedisSessionHandler`，直接依赖 `\Redis`，用 Redis TTL 管理过期。
- 但 `fastd/fastd 8.2` 的 `SessionServiceProvider` 仍只识别 `auto` 和 `swoole_table`，其它值按文件 Session 处理；Redis 的 Provider 集成到 8.3 才完成。
- 因而“升级到 8.2 就自动用上 Redis Session”是不成立的，需要 8.3 的配置写法。

### Parallel

- `fastd/swoole 8.2` 新增 `FastD\Swoole\Concurrency\Parallel`：
  - `Parallel::all(array $tasks, ?float $timeout = null): array`
  - `Parallel::each(array $tasks, ?float $timeout = null, ?callable $onResult = null): array`
  - `Parallel::isConcurrent(): bool`
- 这是 `fastd/swoole 8.2` 的能力；`fastd/fastd 8.2` 的约束是 `fastd/swoole ^8.1`，要确认实际安装到 8.2 才能使用 `Parallel`。
- 在 Swoole 协程上下文中并发执行，在 CGI / 非协程环境按顺序串行执行，业务代码不需要判断运行时。
- 任务必须是 I/O 型；协程内使用阻塞 cURL 会拖住 Worker，`Parallel` 也救不回来。用法见 [Parallel](../cookbook/parallel.md)。

### 路由

- `fastd/routing 8.2` 移除了共享的 matched 状态，每次 `dispatch()` 使用独立的中间件栈副本，避免 Swoole 协程交错时互相污染。
- 这属于内部修复，不改变路由定义方式。

## 8.1

8.1 的主题是 Session 与 SSE，PHP 要求为 >= 8.2。

### Session

- `fastd/http 8.1` 提供 `NativeFileSessionHandler`、`SwooleTableSessionHandler`、`SessionMiddleware`。
- `fastd/fastd 8.1` 的 `SessionServiceProvider` 按运行时选择：
  - CGI / FastCGI：文件 Session；
  - Swoole：Swoole Table；
  - `handler => 'swoole_table'` 可强制使用 Table。
- 此时还没有 `native_file` 别名，也没有 Redis handler。

### SSE

- `fastd/http 8.1` 新增 `SseResponse`、`Event`、`EmitterInterface`、`CgiEmitter`。
- `fastd/swoole 8.1` 新增 `SwooleEmitter`，在协程中负责心跳、背压、断连取消。
- `fastd/fastd 8.1` 新增全局助手 `sse()`。
- Swoole 下使用 SSE 必须开启 `enable_coroutine`；CGI 下要注意 Nginx / FPM 的缓冲与超时。见 [SSE](../cookbook/sse.md)。

### PSR-18 客户端

`FastD\Http\Request\Client` 在 8.1 已经可用，不是 8.2 / 8.3 的新增功能。用法与限制见 [HTTP 客户端](../cookbook/http-client.md)。

## Demo 拆分（dobee / dobee-demo）

Demo 不属于 `fastd/fastd` 核心，但它是 fastD 8.2 前后骨架升级时最容易踩坑的变化之一。

| 包 | 变化 |
|---|---|
| `fastd/dobee` 1.3.x → 1.4.x | 骨架只保留最小欢迎接口和配置示例；Demo 移到 `fastd/dobee-demo`，通过 `require-dev` 安装；Swoole 配置改用 `servers` / `listeners` / `options` |
| `fastd/dobee-demo` 1.3.3 → 1.4.0 | 对齐 fastD 8.2 的配置结构；安装脚本只修改原配置 `return` 数组中的 Demo 注入区，不新增配置文件，重复执行幂等；Demo 不存在时通过 `class_exists()` 降级 |

- `fastd/dobee 1.3.5` 锁定 `fastd/fastd >=8.1 <8.2`，不要继续使用可能解析到 fastD 8.2 但配置仍是旧结构的 `1.3.4`。
- `fastd/dobee 1.4.x` 要求 `fastd/fastd ^8.2`（1.4.2 起为 `^8.3`），Demo 为 `^1.4`。
- 安装 Demo 后，`composer` 脚本会改 `config/service.php` 等文件；升级前先看 `git diff config/`。
- 生产环境用 `composer install --no-dev`，避免 Demo 路由、CORS 中间件和演示页面进入正式应用。

详见 [Demo](../guide/demo.md)、[fastd/dobee](../components/dobee.md)、[fastd/dobee-demo](../components/dobee-demo.md)。

## 版本核对

在应用根目录：

```bash
composer show 'fastd/*'
composer show fastd/fastd
composer show fastd/http
composer show fastd/swoole
```

在组件源码目录：

```bash
git describe --tags
```

文档编写时核对到的 tag：

| 仓库 | tag |
|---|---|
| fastD | `v8.3.1` |
| http | `v8.2.1` |
| swoole | `v8.2.1` |
| event | `v8.0.6` |
| dobee | `v1.4.2` |
| dobee-demo | `v1.4.3` |

这些 tag 只代表文档示例验证过的组合，不构成版本上限。当前矩阵与运行时要求见[兼容性](compatibility.md)。

## 升级入口

| 场景 | 操作 |
|---|---|
| 8.2 → 8.3 | `composer update "fastd/*" --with-dependencies`，检查 `fastd/http` 是否 >= 8.2 |
| 8.1 → 8.2 | 先迁移 Swoole 配置结构，再升级依赖；不能跳过配置迁移 |
| 8.1 → 8.3 | 先完成 8.1 → 8.2，再升 8.3；不要跨大版本直接跳 |
| 回滚 | 恢复 `composer.lock` 与 `config/swoole.php`，再 `composer install` |

完整步骤、验证命令和回滚说明见[升级指南](upgrading.md)。

## 说明

- 本页只记录能从当前源码、tag 和 `UPGRADING.md` 核实的变化；没有发布日期和补丁号承诺。
- Swoole 配置、Session、Parallel、Demo 拆分之外的细节，以各组件页和仓库 README 为准。
- 历史版本（3.x）的 ORM、迁移、认证等内容不属于 8.3 核心，不要按旧文档使用，见[已知问题](known-issues.md)。

# 兼容性

本文档记录编写时验证过的版本组合，以及 FastD 8.3 的运行环境要求。

> 组件独立发布，版本号不要求统一。**实际依赖以应用 `composer.json` / `composer.lock` 与各仓库 Git tag 为准**；本页矩阵用于说明“这套文档的示例在哪些版本上验证过”。

## 当前版本矩阵

| 组件 | Composer 包 | 版本 | 职责 |
|---|---|---|---|
| fastD | `fastd/fastd` | **8.3.1** | 框架核心：Application、Runtime、ServiceProvider |
| http | `fastd/http` | **8.2.1** | PSR-7/17/18、Session、SSE |
| swoole | `fastd/swoole` | **8.2.1** | Swoole Server、Process、IPC、Parallel、SSE Emitter |
| cache | `fastd/cache` | **8.1.6** | Symfony Cache 缓存池、HTTP 缓存 |
| medoodb | `fastd/medoodb` | **8.0.7** | Medoo 数据库与连接池 |
| container | `fastd/container` | **8.1.4** | PSR-11 容器、构造器注入 |
| config | `fastd/config` | **8.0.6** | PHP/YAML/JSON/INI 配置解析 |
| event | `fastd/event` | **8.0.6** | PSR-14 事件调度 |
| middleware | `fastd/middleware` | **8.0.6** | PSR-15 中间件栈 |
| routing | `fastd/routing` | **8.2.0** | PSR-7/PSR-15 路由 |
| dobee | `fastd/dobee` | **1.4.x** | 最小应用骨架 |
| dobee-demo | `fastd/dobee-demo` | **1.4.3** | 官方 Demo 包 |

`fastD 8.3.1` 的 Composer 约束中包含 `fastd/http ^8.2`、`fastd/swoole ^8.1`、`fastd/container ^8.1`；上表是文档示例实际使用的版本组合。`dobee` 当前要求 `fastd/fastd ^8.3`，Demo 为 `^1.4.3`。

## 运行环境

| 项目 | 要求 | 说明 |
|---|---|---|
| PHP | >= 8.4.1 | 代码使用了 PHP 8.4 特性 |
| Swoole | >= 6.0 | 仅 Swoole 运行时需要 |
| Composer | 2.x | 安装与自动加载 |
| 操作系统 | Linux / macOS | Swoole 不支持 Windows |

### PHP 扩展

| 扩展 | 是否必需 | 用途 |
|---|---|---|
| `ext-json` | 必需 | JSON 请求/响应、Session 序列化 |
| `ext-pdo` | 使用 medoodb 时必需 | 数据库连接 |
| `ext-redis` | 使用 Redis Session 时必需 | `RedisSessionHandler` |
| `ext-fileinfo` | 推荐 | 上传文件真实 MIME 校验 |
| `ext-openssl` | 按需 | HTTPS、加密相关能力 |
| `ext-swoole` | Swoole 运行时必需 | HTTP Server、协程 |

## 运行时能力对照

| 能力 | CGI / FastCGI | Swoole |
|---|---|---|
| PSR-7 / PSR-15 请求链路 | 支持 | 支持 |
| Session | 支持（默认文件） | 支持（默认 Swoole Table） |
| Redis Session | 支持 | 支持，但需评估多 Worker 连接共享 |
| SSE | 支持 | 支持，需 `enable_coroutine`；由 `SwooleEmitter` 输出 |
| Parallel | 串行降级 | 协程并发，需 `fastd/swoole >= 8.2` |
| 常驻内存 / 协程 | 否 | 是 |
| 文件上传 | PHP 上传机制 | Swoole 请求解析 + `package_max_length` |

详细差异见[运行时](../guide/runtime.md)、[SSE 场景](../cookbook/sse.md)与 [Parallel 场景](../cookbook/parallel.md)。

## 版本对应关系

| fastD | http | swoole | dobee | dobee-demo |
|---|---|---|---|---|
| 8.3.x | ^8.2 | ^8.1 | 1.4.x | 1.4.x |
| 8.2.x | 8.2.x | 8.2.x | 1.4.x | 1.4.x |
| 8.1.x | 8.1.x | 8.1.x | 1.3.5 | 1.3.3 |

说明：

- 8.3 在 8.2 基础上接入 Redis Session（`RedisSessionHandler` 由 http 8.2 提供），未引入破坏性配置变更。
- `dobee 1.3.4` 的约束可能解析到 fastD 8.2，但 Swoole 配置仍是旧结构；应使用 `1.3.5`。
- `dobee 1.4.x` 将 Demo 拆分到 `fastd/dobee-demo`，Swoole 配置使用 `servers` / `listeners` / `options`。
- 组件补丁版本可能继续发布，例如 `fastd/http 8.2.x`、`fastd/swoole 8.2.x`，以 Packagist 与 tag 为准。

## 检查当前版本

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

检查运行环境：

```bash
php -v
php -m | grep -E 'json|pdo|redis|swoole'
php --ri swoole
```

`php --ri swoole` 能确认 Swoole 版本与编译选项；没有版本信息说明扩展未加载。

## 升级与排障

- 跨版本升级步骤、配置变更与回滚见[升级指南](upgrading.md)。
- 版本不匹配、扩展缺失、运行时差异导致的常见问题见[FAQ](faq.md)。
- 组件职责与依赖关系见[组件总览](../components/README.md)。

# FastD 8.3 使用手册

FastD 是面向 API 场景的轻量级 PHP 框架，基于 PSR 标准，同时支持 CGI / FastCGI 与 Swoole 6 运行时。

## 版本要求

| 项目 | 要求 |
|---|---|
| PHP | >= 8.4.1 |
| Swoole | >= 6.0（Swoole 运行时） |
| Composer | 2.x |

## 推荐阅读路径

### 第一次使用

1. [快速开始](guide/getting-started.md)
2. [项目结构](guide/project-structure.md)
3. [路由与控制器](guide/routing-controller.md)
4. [请求与响应](guide/request-response.md)

### 熟悉框架后

- [配置](guide/configuration.md)
- [生命周期](guide/lifecycle.md)
- [辅助函数](guide/helpers.md)
- [中间件](guide/middleware.md)
- [事件与监听器](guide/events.md)
- [ServiceProvider](guide/service-provider.md)
- [Session](guide/session.md)
- [运行时](guide/runtime.md)
- [异常与日志](guide/error-logging.md)
- [安全](guide/security.md)
- [缓存](guide/cache.md)
- [数据库](guide/database.md)
- [Console 与 Process](guide/console-process.md)
- [测试](guide/testing.md)
- [部署](guide/deployment.md)
- [Demo](guide/demo.md)

### 组件细节

从 [组件总览](components/README.md) 进入各组件文档。

## 组件生态

| 组件 | 说明 |
|---|---|
| `fastd/fastd` | 框架核心：Application、Runtime、ServiceProvider |
| `fastd/http` | PSR-7/17/18 HTTP、Session、SSE |
| `fastd/swoole` | Swoole Server、Process、IPC、Parallel |
| `fastd/routing` | PSR-7/PSR-15 路由 |
| `fastd/middleware` | PSR-15 中间件栈 |
| `fastd/container` | PSR-11 容器与构造器注入 |
| `fastd/config` | PHP/YAML/JSON/INI 配置解析 |
| `fastd/event` | PSR-14 事件调度 |
| `fastd/cache` | Symfony Cache 缓存池与 HTTP 缓存 |
| `fastd/medoodb` | Medoo 数据库与连接池 |
| `fastd/dobee` | 最小应用骨架 |
| `fastd/dobee-demo` | 官方 Demo 包 |

## 本地预览本文档

在 `fastdlabs/docs` 仓库根目录：

```bash
python3 -m http.server 3000
```

打开 <http://127.0.0.1:3000/>。

> 本手册对应 FastD 8.3；组件版本会随发布更新，见[兼容性说明](reference/compatibility.md)。

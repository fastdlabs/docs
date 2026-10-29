# 基础手册

本章覆盖使用 FastD 开发应用的完整主链路。

| 页面 | 内容 |
|---|---|
| [快速开始](getting-started.md) | 安装、启动、首个接口 |
| [项目结构](project-structure.md) | dobee 骨架目录与配置职责 |
| [配置](configuration.md) | bootstrap、config/*、变量替换、日志 |
| [生命周期](lifecycle.md) | CGI/Swoole/Console 启动、请求与事件顺序 |
| [路由与控制器](routing-controller.md) | 路由定义、参数、控制器、依赖注入 |
| [请求与响应](request-response.md) | PSR-7、JSON/Text/Redirect、Cookie、上传下载 |
| [辅助函数](helpers.md) | container/config/event/json/sse 等 helper |
| [中间件](middleware.md) | PSR-15、路由中间件、全局中间件 |
| [事件与监听器](events.md) | config/listener.php、自定义事件、传播控制 |
| [ServiceProvider](service-provider.md) | 扩展框架的标准接入方式 |
| [Session](session.md) | 文件/Swoole Table/Redis、CSRF、flash |
| [运行时](runtime.md) | CGI 与 Swoole、配置、协程与 Parallel |
| [异常与日志](error-logging.md) | Monolog、abort、404/500、错误中间件 |
| [安全](security.md) | Cookie、CSRF、上传、密钥与 CORS |
| [部署](deployment.md) | Nginx/FPM、Swoole、runtime 权限、发布 |
| [缓存](cache.md) | CachePool、适配器、HTTP 缓存 |
| [数据库](database.md) | MedooDB、连接池、CRUD、事务 |
| [Console 与 Process](console-process.md) | 命令、Worker、信号 |
| [测试](testing.md) | 测试基类、请求分发、断言 |
| [Demo](demo.md) | Demo 安装、首页与运行时切换 |

建议按顺序阅读，遇到组件 API 细节时跳到[组件文档](../components/README.md)。

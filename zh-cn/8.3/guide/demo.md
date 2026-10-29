# Demo

官方 Demo 包：`fastd/dobee-demo`。

## 安装

```bash
composer require --dev fastd/dobee-demo
```

Composer 安装脚本会：

- 读取原 `config/service.php`、`config/swoole.php`
- 注入 `DemoServiceProvider`
- 注入 Demo 监听端口
- 保留已有配置和注释
- 重复执行幂等

Demo 代码不进入 `fastd/dobee` 骨架仓库。

## 启动

### CGI（推荐用于查看页面）

```bash
php -S 127.0.0.1:8099 -t web
```

打开：

```text
http://127.0.0.1:8099/demo/index.html
```

### Swoole

```bash
php bin/server start
```

## Demo 首页

- 左侧：Demo 页面列表
- 中间：点击后在 iframe 内展示，不跳转
- 右侧：CGI / Swoole 切换、启动命令、当前 API 域名
- 页面右下角：页面域名、实际 API 域名、最近请求

HTML 页面固定从 CGI 域名加载；API 请求根据右侧选择切换：

| 模式 | API 域名 |
|---|---|
| CGI | 当前 URL 域名 |
| Swoole | `config/swoole.php` 的 `servers.http.host` / `port` |

## 覆盖场景

```text
Session / CSRF / 注销
请求信息
Cookie
文件上传（1MB、类型校验）
文件下载
自定义事件
响应状态 / 重定向
异常处理 404 / 500
配置 / 运行时
CORS / OPTIONS
缓存管理
数据库事务
SSE / AI 流式
Swoole 运行时
Parallel 协程
Console / Process
```

## 注意

- Demo HTML 页面建议通过 CGI 访问。
- Swoole API 需要单独启动；跨域请求由 Demo CORS 中间件处理。
- 生产部署使用 `--no-dev` 或移除 demo 包。

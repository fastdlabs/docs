# 部署

## 概念与选型

FastD 有两种 HTTP 运行方式：

| 方式 | 入口 | 适用 |
|---|---|---|
| Nginx + PHP-FPM（FastCGI） | `web/index.php` → `CgiServer` | 常规 Web 部署、与现有 FPM 体系共存 |
| Swoole 常驻进程 | `bin/server` → `SwServer` | 高并发 API、需要协程/SSE/常驻内存 |

Console（`bin/console`）与 Process（`bin/process`）是命令行入口，不参与 HTTP 服务。

无论哪种方式，Web 根都必须指向 `web/`，不要把项目根或 `config/`、`runtime/` 暴露给 Nginx。开发阶段可以用 `php -S 127.0.0.1:8099 -t web` 快速验证，但内置服务器默认是单进程模型，只适合本地开发。

## 发布构建

```bash
# 新目录/新 Release 中执行
composer install --no-dev --optimize-autoloader

# 校验
php -v                                  # >= 8.4.1
php -m | grep -E 'json|pdo|swoole'
composer check-platform-reqs
```

说明：

- `--no-dev` 会移除 `phpunit`、`phpstan`、`fastd/dobee-demo`。Demo 的 Provider、路由、监听器、额外 Swoole 端口随即消失。
- `symfony/console` 是 `fastd/fastd` 的运行时依赖，`--no-dev` 不影响 `bin/console`。
- `config/service.php` 中对 Demo 的注册应保持 `class_exists()` 保护；`config/swoole.php` 里由安装脚本注入的 Demo 端口同样带保护。手工写死的 Demo 类名会在 `--no-dev` 下启动失败。
- `src/bootstrap.php` 里的路径都用 `__DIR__`，每个 Release 目录默认有自己的 `runtime/`。需要跨 Release 复用日志、Session、上传时，在发布时把 `runtime` 指向共享目录：

```bash
ln -s /var/www/app/shared/runtime /var/www/app/releases/20261029/runtime
```

- `.env.yml` 不入库，按环境单独下发（0600，属主为运行用户）；部署后检查配置里没有残留 `%...%` 占位符。

推荐目录：

```text
/var/www/app/
├── current -> releases/20261029
├── releases/
│   └── 20261029/
└── shared/
    └── runtime/
        ├── logs/ pid/ session/ cache/ uploads/
```

## Nginx + PHP-FPM

```nginx
upstream php_fpm {
    server unix:/run/php/php8.4-fpm.sock;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    root /var/www/app/current/web;
    index index.php;

    client_max_body_size 10m;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/index\.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/index.php;
        fastcgi_param REQUEST_SCHEME $scheme;
        fastcgi_param HTTPS $https if_not_empty;

        fastcgi_pass php_fpm;
        fastcgi_read_timeout 60s;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

要点：

- `root` 指向 `web/`，不要把项目根指进去。
- 所有动态请求都进 `index.php`；`try_files` 保留原始 URI，FastD 从 `REQUEST_URI` 取路径。
- `SCRIPT_FILENAME` 固定为入口文件，不依赖 `PATH_INFO`。
- 应用通过 `HTTPS=on` 或 `REQUEST_SCHEME` 判断 https；TLS 终止在 LB 时，用 `map` 从 `X-Forwarded-Proto` 生成这两个参数。
- 上传大小三处对齐：`client_max_body_size`、`upload_max_filesize`/`post_max_size`、应用层校验。
- SSE 需要 `fastcgi_read_timeout` 放大，并设置 `fastcgi_buffering off;`、`gzip off;`。

PHP-FPM pool 的运行用户必须能读代码、写 `runtime/`。常见为 `www-data`（Debian/Ubuntu）或 `www`（部分镜像）。

## Swoole 部署

`config/swoole.php`：

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
        'worker_num' => 4,
        'enable_coroutine' => true,
        'http_compression' => false,
        'max_request' => 10000,
        'display_errors' => false,
        'package_max_length' => 10 * 1024 * 1024,
        'user' => 'www-data',
        'group' => 'www-data',
    ],
];
```

框架会覆盖/补充的项：

- `pid_file` 固定为 `{root}/runtime/pid/{name}.pid`，`name` 来自 bootstrap。
- `log_file` 固定为 `{root}/runtime/logs/{YYYYmm}/error.log`，并启用按天切割；配置里写自己的 `log_file` 不生效。
- 其余 `options` 原样传给 Swoole。`Server` 的默认值包括 `worker_num=1`、`open_cpu_affinity=true`、`max_request=0`、`reload_async=true`、`user/group=www`、`display_errors=true`，生产建议显式覆盖。

参数建议：

- `worker_num`：从 CPU 核数起步，按压测调整；协程模式下不要盲目开很大。
- `enable_coroutine`：SSE、`Parallel` 依赖它；开启后禁止在请求里做阻塞 I/O。
- `max_request`：给 worker 设置回收上限，避免长跑内存增长；默认 0 表示不回收。
- `package_max_length`：决定单请求体上限，上传场景要与 Nginx/应用限制对齐。
- `http_compression=false`：避免压缩缓冲破坏 SSE。
- `display_errors=false`：生产关闭 Swoole 的错误输出。
- `user`/`group`：以 root 启动时会 setuid；非 root 启动时保持与运行用户一致或去掉。

### 直连与反向代理

直连：把 `host` 改为 `0.0.0.0` 并只对可信网段开放端口。框架默认没有 TLS 配置，公网建议在前面放 Nginx 终止 TLS。

反向代理（推荐）：

```nginx
upstream fastd_swoole {
    server 127.0.0.1:9527;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_buffering off;        # SSE 必须
        proxy_read_timeout 3600s;   # SSE 长连接

        proxy_pass http://fastd_swoole;
    }
}
```

`Host` 要透传，否则 `ServerRequest` 的 URI host 会变成上游地址。框架不会自动信任 `X-Forwarded-For`，需要真实客户端 IP 时在应用层自行解析并只信任已知代理。

监听 `127.0.0.1` 时，Swoole 只能被本机 Nginx 访问，别忘记防火墙只放行 80/443。

## runtime 权限

| 路径 | 创建者 | 建议权限 |
|---|---|---|
| `runtime/` | 部署脚本 | 0750，属主为运行用户 |
| `runtime/logs/YYYYmm/` | `Application`（0755） | 0750，日志文件 0640 |
| `runtime/pid/` | `Server::touchPidFile()`（0755） | 0750 |
| `runtime/session/` | `NativeFileSessionHandler`（0700） | 0700，文件 0600 |
| `runtime/cache/` | Symfony Cache 适配器 | 运行用户可写 |
| `runtime/uploads/` | `UploadedFile::moveTo()`（0755） | 0750，文件 0640 |
| `runtime/demo.sqlite` | SQLite | 运行用户可写，禁止 Web 访问 |

```bash
sudo mkdir -p /var/www/app/shared/runtime/{logs,pid,session,cache,uploads}
sudo chown -R www-data:www-data /var/www/app/shared/runtime
sudo find /var/www/app/shared/runtime -type d -exec chmod 750 {} \;
sudo chmod 700 /var/www/app/shared/runtime/session
```

注意：

- 日志目录在 bootstrap 阶段由**当前进程用户**创建。若以 root 启动 Swoole、随后 setuid 到 `www`，root 创建的 0755 目录会让 worker 无法写日志。应预先按运行用户建好目录，或直接以运行用户启动。
- `NativeFileSessionHandler` 对已存在目录不会改权限，部署时要自己收紧。
- Windows/容器挂载卷上的权限模型不同，容器内要确保 UID 对齐。

## 启动 / 停止 / 重载 / 状态

```bash
php bin/server start          # 前台启动，阻塞
php bin/server start -d       # 守护进程
php bin/server stop
php bin/server reload
php bin/server status
```

实际行为：

- 第一个位置参数是 action，缺省为 `status`；`-d`/`--daemon` 可出现在任意位置。`php bin/server -d` 只会“守护化 + status”，不会启动服务。
- `stop` 向 pid 文件中的进程发送 `SIGTERM`；`reload` 发送 `SIGUSR1`；`status` 用 signal 0 探测进程。
- `status` 的返回值只写日志，终端没有输出，也没有可靠的退出码；不要把它当健康检查。
- pid 文件位于 `runtime/pid/{name}.pid`。**pid 文件不存在时 `getPid()` 返回 0**，此时 `status`/`stop` 会向 pid 0 发信号（即当前进程组），可能误判或误伤。执行前先确认文件存在。
- `reload` 是异步的（默认 `reload_async=true`），发出后要等待 worker 重启完成再继续发布。
- `reload` 只重启 worker：master 中已经完成的 bootstrap、Provider、路由不会重新执行。修改 `src/bootstrap.php`、`config/*`、Provider 或路由后必须 `stop` + `start`。
- 只改控制器等按需加载的代码，`reload` 可能生效，但受 opcache 与已加载类影响，不保证；生产建议统一完整重启。

systemd 示例（前台模式，不要加 `-d`）：

```ini
[Unit]
Description=FastD Swoole Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/app/current
ExecStart=/usr/bin/php bin/server start
ExecReload=/bin/kill -USR1 $MAINPID
ExecStop=/bin/kill -TERM $MAINPID
Restart=always
RestartSec=3
LimitNOFILE=65535
KillMode=mixed
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

## 健康检查与优雅重启

框架没有内置健康检查端点，自己加一条最简路由：

```php
// routes/web.php
return [
    ['GET', '/health', fn () => json(['status' => 'ok'])],
];
```

需要检查依赖时，在 handler 里探活数据库/Redis，但保持轻量并设置超时，避免健康检查本身拖垮服务。

Nginx 侧：

```nginx
upstream fastd_swoole {
    server 127.0.0.1:9527 max_fails=3 fail_timeout=10s;
    server 127.0.0.1:9528 backup;
    keepalive 32;
}
```

发布流程建议：

1. 新 Release 目录 `composer install --no-dev`，准备共享 `runtime`。
2. 启动新实例（新端口/新目录），轮询 `/health` 直到 200。
3. 切换 Nginx upstream 或 `current` 软链。
4. 观察错误日志与 5xx，再停止旧实例。
5. 单实例发布则 `reload` 后等待 worker 重启完成；涉及配置/Provider/路由改动时用 `stop` + `start`，并接受短暂中断。

优雅停止：

- `SIGTERM` 后 Swoole 停止接收新连接并等待 worker 退出；长请求/SSE 会拖长停止时间，必要时配置 `max_wait_time`（Swoole 选项）并让客户端支持重连。
- `KillMode=mixed` + `TimeoutStopSec` 给 master 留出清理时间，避免 systemd 直接杀整个 cgroup。
- 停止前先从 Nginx upstream 摘除节点，等待在途请求结束。

## 注意事项 / 常见错误

- **502 Bad Gateway**：FPM socket 路径错误、权限不足，或 Swoole 端口未监听。
- **所有路由 404**：Nginx `root` 没指向 `web/`，或缺少 `try_files ... /index.php`，或 `SCRIPT_FILENAME` 指向了错误文件。
- **500 且提示类不存在**：发布时没执行 `composer install`/`dump-autoload`，或 `--no-dev` 后仍引用 Demo 类。
- **日志写入失败**：`runtime/logs` 属主不是运行用户，或 Swoole 以 root 创建目录后 setuid。
- **Session 丢失**：多节点仍用文件/ Swoole Table；跨节点应使用 Redis。单机 Swoole 多 worker 用 `auto` 会走 Swoole Table。
- **`failed to set process user`**：`options.user/group` 指定的用户不存在，或非 root 启动却尝试 setuid。
- **stop 没反应/误杀**：pid 文件缺失或被删，`getPid()` 为 0；先检查 `runtime/pid/*.pid` 与进程。
- **reload 后配置没变**：master 不重新 bootstrap，需要完整重启。
- **SSE 不实时**：Nginx `proxy_buffering`/`fastcgi_buffering` 未关，或 Swoole `http_compression=true`。
- **上传 413**：Nginx `client_max_body_size`、PHP `post_max_size`、Swoole `package_max_length` 任一过小。
- **端口只对本机开放**：`host=127.0.0.1` 时只能被本机反代访问，直连需要改为 `0.0.0.0` 并配置防火墙。

## 相关链接

- [运行时](runtime.md)
- [配置](configuration.md)
- [生命周期](lifecycle.md)
- [异常与日志](error-logging.md)
- [安全](security.md)
- [版本升级说明](../reference/upgrading.md)
- [fastd/swoole](../components/swoole.md)
- [fastd/dobee](../components/dobee.md)
- [SSE 场景](../cookbook/sse.md)

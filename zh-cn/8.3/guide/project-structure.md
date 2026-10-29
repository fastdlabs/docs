# 项目结构

以 `fastd/dobee` 骨架为例：

```text
my-app/
├── bin/
│   ├── console              # 命令行入口
│   ├── process              # 多进程入口
│   └── server               # Swoole Server 入口
├── config/
│   ├── cache.php            # 缓存池 / HTTP 缓存
│   ├── command.php          # 命令注册
│   ├── database.php         # 数据库连接
│   ├── listener.php         # 应用事件监听
│   ├── process.php          # Worker / 信号监听
│   ├── service.php          # ServiceProvider
│   ├── session.php          # Session handler
│   └── swoole.php           # Swoole servers/listeners/options
├── routes/
│   └── web.php              # HTTP 路由
├── src/
│   ├── bootstrap.php        # 应用 bootstrap 配置
│   └── Http/Controller/     # Controller
├── tests/
│   └── Feature/             # 功能测试
├── web/
│   └── index.php            # FastCGI 入口
└── runtime/                 # 日志、缓存、Session、PID
```

## 启动链路

```text
bin/server
  → FastD\Server\SwServer
  → Application::bootstrap('swoole')
  → 读取 config/service.php、listener.php、route
  → 读取 config/swoole.php 创建监听
```

CGI：

```text
web/index.php
  → FastD\Server\CgiServer
  → Application::bootstrap('fastcgi')
  → dispatch(ServerRequest::fromGlobals())
```

## bootstrap 配置

`src/bootstrap.php` 返回应用级配置：

```php
return [
    'name' => 'my-app',
    'root' => __DIR__ . '/..',
    'timezone' => 'Asia/Shanghai',
    'log' => [
        'path' => __DIR__ . '/../runtime/logs',
        'level' => \Monolog\Level\Debug,
    ],
    'route' => __DIR__ . '/../routes/web.php',
    'service' => __DIR__ . '/../config/service.php',
    'listener' => __DIR__ . '/../config/listener.php',
    'swoole' => __DIR__ . '/../config/swoole.php',
];
```

`Application::config('swoole')` 等会读取对应的配置文件。

## 下一步

- [路由与控制器](routing-controller.md)
- [运行时](runtime.md)

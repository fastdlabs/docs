# 配置

## 概念与职责

FastD 的配置由三部分组成：

| 位置 | 职责 | 读取方式 |
|---|---|---|
| `src/bootstrap.php` | 应用引导数组，声明名称、根目录、时区、日志、入口文件，以及“配置键 → 配置文件”的映射 | 框架在启动时直接读取 |
| `config/*.php` | 按领域拆分的配置文件，必须 `return` 数组 | `Application::config($key)` / `config()` |
| `.env.yml` | 变量源，为配置值提供 `%var%` 替换 | 由 `FileParser` 在启动时加载 |

容器中的 `config` 服务是 `FastD\Config\FileParser`。它有两个属性：`$parsed` 累积已解析的配置，`$var` 保存变量源。`Application::config()` 返回解析后的**数组**，`config()` 助手返回 **FileParser 对象**，两者不要混用。

## src/bootstrap.php 配置项

`Application` 在构造时接收这个数组，并在 `bootstrap($runtime)` 中按固定顺序使用它。

| 键 | 是否必需 | 作用 |
|---|---|---|
| `name` | 是 | 应用名。用作 Monolog channel、Swoole pid 文件名、Console 名称 |
| `root` | 是 | 应用根目录。用于定位 `.env.yml`、拼 runtime 路径 |
| `timezone` | 是 | 传给 `date_default_timezone_set()`，同时作为 Logger 时区 |
| `log.path` | 是 | 日志根目录，框架会在其下创建 `YYYYmm` 子目录 |
| `log.level` | 是 | Monolog 级别，接受 `Monolog\Level`、整型或字符串 |
| `route` | 是 | 路由文件路径，必须返回路由数组 |
| `service` | 是 | ServiceProvider 类名列表文件 |
| `listener` | 是 | 事件监听器类名列表文件 |
| 其他键 | 否 | 约定“键名 = 配置文件路径”，供 `Application::config($key)` 读取 |

完整的 `src/bootstrap.php`：

```php
<?php

return [
    'name' => 'fastd8',
    'root' => __DIR__ . '/..',
    'timezone' => 'Asia/Shanghai',

    'log' => [
        'path' => __DIR__ . '/../runtime/logs',
        'level' => \Monolog\Level::Debug,
    ],

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

只有 `route`、`service`、`listener` 会在启动时被 `include`；其余键只在调用 `Application::config()` 时才解析文件。

dobee 骨架已有的配置键与读取方：

| 键 | 文件 | 读取方 |
|---|---|---|
| `cache` | `config/cache.php` | `CacheServiceProvider`、`ServerRequestCacheProvider` |
| `database` | `config/database.php` | `DatabaseServiceProvider` |
| `session` | `config/session.php` | `SessionServiceProvider` |
| `command` | `config/command.php` | `Terminal\Console::input()` |
| `process` | `config/process.php` | `Terminal\Process::input()` |
| `swoole` | `config/swoole.php` | `Server\SwServer::bootstrap()` |

## config/* 配置文件

`config/` 下每个文件返回一个数组，框架不做结构校验，结构由读取方（Provider、Console、SwServer）约定。

```php
// config/session.php
return [
    'enabled' => true,
    'handler' => 'auto',
    'ttl' => 1440,
    'cookie' => [
        'name' => 'FASTD_SESSID',
        'secure' => false,
        'http_only' => true,
        'same_site' => 'Lax',
    ],
];
```

```php
// src/bootstrap.php 中对应的映射
'session' => __DIR__ . '/../config/session.php',
```

## config() 与 Application::config()

```php
// 返回 FileParser：读取“已经解析过”的配置树；文件尚未解析时只会得到默认值
$app = config();                       // FastD\Config\FileParser
$ttl = config()->parsed->get('session.ttl', 1440);
$host = config()->var->get('database.default.host');

// 返回数组：每次调用都会重新解析对应文件
$application = container();
$swoole = $application->config('swoole');
$session = $application->config('session');
```

注意 `FileParser` 本身没有 `get()` 方法，不能写 `config()->get('session.ttl')`；要么读 `->parsed`，要么用 `Application::config()`。

### 实际行为

`Application::config($key)` 的逻辑是：

1. `$bootstrap[$key]` 不存在，或对应文件不存在 → 抛 `ErrorException`（`The bootstrap["xxx"] config does not exist`）。
2. 取出容器中的 `config` 服务，必须是 `FileParser`。
3. `parse($file)`：按扩展名加载，做 `%var%` 替换，再以**文件名去掉扩展名**为顶层键合并进 `$parsed`。
4. `->get($key)` 取出该顶层键并返回。

由此产生几个容易踩的行为：

- 配置键必须与文件名一致。`'db' => config/database.php` 会解析出顶层键 `database`，`get('db')` 得到 `null`，而返回类型声明为 `array`，最终是 `TypeError`。
- 每次调用都会重新 `include` 文件并合并到同一个 `$parsed`。字符串键的值会被覆盖，数字索引的列表则可能重复追加。例如连续两次 `$app->config('command')`，命令列表可能变成 `[A, A]`。某个文件已经解析过之后，反复读取优先用 `config()->parsed->get('command')`。
- 配置文件是 PHP，`include` 时就会执行；不要在配置文件里做 I/O 或依赖请求上下文。
- `bootstrap()` 自身是幂等的：`Application::$booted` 为真后不再重复注册监听器、服务与路由。

## .env.yml 与变量替换

`.env.yml` 放在 `root` 下，作为 `FileParser` 的变量源；它**不是**普通配置文件，不会出现在 `config()->parsed` 的顶层键中。

```yaml
# .env.yml（不要提交到仓库）
database:
  default:
    host: 127.0.0.1
    name: app
    user: app
    pass: secret
```

```php
// config/database.php
return [
    'default' => [
        'type' => 'mysql',
        'host' => '%database.default.host%',
        'database' => '%database.default.name%',
        'username' => '%database.default.user%',
        'password' => '%database.default.pass%',
        'charset' => 'utf8mb4',
        'port' => 3306,
    ],
];
```

替换规则（`FileParser::replace()`）：

- 只替换字符串中的 `%key%`，数组会递归处理；非字符串原样保留。
- `key` 允许字母、数字、下划线和点，点按 `Parsed` 的嵌套路径解析，因此 `%database.default.host%` 可用。
- 未定义的变量不会报错，会保留 `%key%` 原文，容易把占位符带进运行时，部署后要检查。
- 变量名不支持短横线等其它字符。
- `.env.yml` 不存在时变量集合为空，启动不报错；`file_exists()` 判断发生在 `Application::defaultServices()`。
- 每个 `Application` 启动时加载一次；CGI 每请求都会重新读取，Swoole 常驻进程修改后必须重启，`reload` 不会重新读取。

当前 dobee 的 `config/*.php` 并没有使用 `%...%`，所以仅提供 `.env.yml` 不会自动覆盖这些配置；只有配置值里显式写了占位符才生效。框架也没有 `env()` 助手，需要读系统环境变量时，在 `config/*.php` 里直接调用 `getenv()`。

`.env.yml` 已被 dobee 的 `.gitignore` 忽略，仓库只保留 `.env.yml.example`。密钥管理见[安全](security.md)。

## 日志配置

日志在 `Application::defaultServices()` 中创建，早于所有 ServiceProvider：

```php
$logDir = $bootstrap['log']['path'] . '/' . date('Ym');
// 目录不存在则 mkdir(0755, true)，失败抛 ErrorException
$logFile = $logDir . '/' . $bootstrap['runtime'] . '.log';
$logger = new Logger($runtime, [
    new RotatingFileHandler($logFile, 100, $bootstrap['log']['level']),
], [], new DateTimeZone($timezone));
```

实际落盘：

- 目录：`runtime/logs/202610/`
- 文件：`fastcgi-2026-10-29.log`、`swoole-2026-10-29.log`、`console-...`、`process-...`（`RotatingFileHandler` 默认文件名格式为 `{filename}-{date}`）
- 保留：最多 100 个文件
- 级别：`log.level`，例如 `\Monolog\Level::Debug`、`\Monolog\Level::Info`
- channel：当前运行环境名（`fastcgi`、`swoole`、`console`、`process`）

生产环境不建议使用 `Debug`：它会把所有 `debug()` 调用写入磁盘。日志写入与 `debug()`/`info()`/`error()` 的用法见[异常与日志](error-logging.md)。

## 注意事项

- 新增配置键时，同步修改 `src/bootstrap.php`，否则 `Application::config()` 会抛 `ErrorException`。
- 配置文件名不要带多个点（如 `app.config.php`），顶层键 `app.config` 会与点路径分隔符冲突。
- 不要用 `config()` 的返回值当数组；它返回 `FileParser`。需要数组时用 `container()->config($key)`。
- `.env.yml` 只做变量替换，缺失变量保留原文且不报错，建议在部署检查中 grep `%`。
- `.env.yml` 与 `config/*.php` 都可能含密钥，注意仓库忽略规则与 `runtime` 权限。
- Swoole 在 master 进程完成配置加载，`reload` 只重启 worker；修改 bootstrap 或配置文件后要 `stop` + `start`。
- 日志目录由当前执行用户创建，Swoole 若切换运行用户，需保证该用户对 `runtime/logs` 有写权限。

## 相关链接

- [fastd/config 组件](../components/config.md)
- [项目结构](project-structure.md)
- [生命周期](lifecycle.md)
- [异常与日志](error-logging.md)
- [快速开始](getting-started.md)
- [版本升级说明](../reference/upgrading.md)

# fastd/config

FastD 8.3 生态中的配置解析组件（8.0 版本线），支持 PHP、YAML、JSON、INI 四种格式与 `%变量%` 替换。

## 用途与定位

- `FileParser` 按扩展名加载配置文件，返回可点路径访问的 `Parsed` 对象
- `Parsed` 基于 `ArrayObject`，支持 `get/set/has/unset`、深层合并与数组访问
- 把环境变量（如 `.env.yml`）注入配置值
- FastD 应用用它加载 `config/*.php`，`Application::config()` 即基于本组件

## 安装

```bash
composer require fastd/config
```

依赖 `symfony/yaml ^8.0`、`ext-json`；PHP >= 8.4.1。

## 核心 API / 类

| 类 / 方法 | 说明 |
|---|---|
| `FastD\Config\FileParser::__construct(array\|string $vars = [])` | `$vars` 为变量数组或变量配置文件路径 |
| `FileParser::load(string $file): array` | 按扩展名加载并返回数组 |
| `FileParser::parse(string $file): Parsed` | 加载、替换变量，并以文件名作为顶层键合并到 `$parser->parsed` |
| `FileParser::$parsed` | 累积所有已解析配置的 `Parsed` |
| `FileParser::$var` | 变量集合（`Parsed`） |
| `Parsed::get(string $key, mixed $default = null)` | 点路径读取，如 `database.host` |
| `Parsed::set(string $key, mixed $value)` | 支持点路径写入 |
| `Parsed::has(string $key)` / `Parsed::unset(string $key)` | 判断 / 删除 |
| `Parsed::merge(array $parsed): self` | 递归合并数组 |

变量替换规则：字符串中的 `%name%` 会替换为 `$vars['name']`；未定义的变量保持原样。

## 配置

组件没有独立配置文件。格式由文件扩展名决定：

| 扩展名 | 解析方式 |
|---|---|
| `.php` | `include`，必须返回数组 |
| `.yml` / `.yaml` | `Symfony\Component\Yaml\Yaml::parseFile()` |
| `.json` | `json_decode(..., true)` |
| `.ini` | `parse_ini_file($file, true)`，支持 section |

FastD 应用在 `src/bootstrap.php` 中把配置键映射到文件：

```php
return [
    'cache' => __DIR__ . '/../config/cache.php',
    'database' => __DIR__ . '/../config/database.php',
    'swoole' => __DIR__ . '/../config/swoole.php',
];
```

之后 `container()->config('cache')` 返回 `config/cache.php` 中 `cache` 顶层键对应的数组。

## 最小示例

```php
use FastD\Config\FileParser;

// config/database.yml:
// host: "%db_host%"
// port: 3306

$parser = new FileParser(['db_host' => '127.0.0.1']);
$config = $parser->parse(__DIR__ . '/config/database.yml');

echo $config->get('database.host'); // 127.0.0.1
echo $config->get('database.port'); // 3306

$config->set('database.port', 3307);
$config->has('database.port'); // true
```

读取 FastD 已加载的配置：

```php
$cache = container()->config('cache');          // 数组
$enable = config()->parsed->get('cache.httpCache.enable', false);
```

## 注意事项

- `parse()` 的顶层键是**文件名去掉扩展名**：`database.yml` → `database`，所以文件内容不要再多包一层 `database:`，否则路径会变成 `database.database.host`。
- 文件名不要带多个点（如 `app.config.php`）：顶层键 `app.config` 会与点路径分隔符冲突，导致 `get('app.config.host')` 解析失败。
- `parse()` 返回的是同一个 `Parsed` 实例并持续合并；重复解析同名文件时旧值可能残留，需要干净结果时新建 `FileParser`。
- 变量只替换字符串值，数组会递归处理；未定义变量不会报错，会保留 `%name%` 原文。
- `Application::config($key)` 每次调用都会重新解析文件；高频读取时先存局部变量，不要放在循环里。
- `Application::config()` 在 `$bootstrap[$key]` 不存在或文件缺失时抛 `ErrorException`，新增配置键要同步修改 `src/bootstrap.php`。
- PHP 配置文件必须 `return` 数组；INI 解析失败时 `parse_ini_file()` 会返回 `false`。
- `.env.yml` 由 `Application` 作为变量源加载，供 `%key%` 使用；它不是普通配置文件，不会出现在 `config()->parsed` 的顶层键中。
- `Parsed::get()` 会先尝试完整键名，再按 `.` 拆分，因此含点的键名只有精确匹配时才能读到。

## 相关源码 / README

- [fastd/config README](https://github.com/fastdlabs/config/blob/master/README.md)
- [项目结构](../guide/project-structure.md)
- [组件总览](README.md)

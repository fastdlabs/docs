# fastd/medoodb

FastD 8.3 生态中的数据库组件（8.0 版本线），基于 Medoo，提供多连接池、自动重连和 ServiceProvider 集成。

## 用途与定位

- `Database` 继承 `Medoo\Medoo`，保留全部 Medoo 查询 API
- `DatabasePool` 按名称管理多个连接，连接复用、可强制重连
- `DatabaseServiceProvider` 读取 `config/database.php` 并注册 `medoodb` 服务
- 统一设置 PDO 异常模式与关联数组读取
- 支持 MySQL、PostgreSQL、SQLite、MariaDB、MSSQL 等 PDO 驱动

## 安装

```bash
composer require fastd/medoodb
```

- PHP >= 8.4.1
- `ext-pdo` 及对应驱动（`pdo_mysql`、`pdo_sqlite` 等）
- 依赖 `catfan/medoo ^2.2`

## 核心 API / 类

| 类 / 方法 | 说明 |
|---|---|
| `FastD\MedooDB\Database::__construct(array $config)` | 创建连接；同时设置 PDO 异常模式与 `FETCH_ASSOC` |
| `Database::reconnect(): void` | 用原配置重新连接 |
| `Database::query(string $sql, array $map = []): ?PDOStatement` | 原生查询，异常时重连并重试一次 |
| `Database::exec(string $sql, array $map = [], ?callable $callback = null)` | 原生执行，同样带一次重连重试 |
| `DatabasePool::getDatabase(string $key, bool $reconnect = false)` | 获取连接；`true` 强制重建 |
| `DatabasePool::initConnections(): void` | 初始化全部连接（Swoole Booted 阶段调用） |
| `FastD\MedooDB\ServiceProvider\DatabaseServiceProvider` | 注册 `medoodb` 服务并挂载 `BootedEventListener` |
| `FastD\MedooDB\Listener\BootedEventListener` | Swoole 运行时调用 `initConnections()` |

继承自 Medoo 的常用方法：`select()`、`insert()`、`update()`、`delete()`、`count()`、`sum()`、`action()`、`id()`、`pdo`。

## 配置

`config/database.php` 的每个顶层键是一个连接名：

```php
return [
    'default' => [
        'type' => 'sqlite',
        'database' => __DIR__ . '/../runtime/demo.sqlite',
    ],

    'mysql' => [
        'type' => 'mysql',
        'host' => '127.0.0.1',
        'port' => 3306,
        'database' => 'app',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
        'prefix' => '',
        'option' => [],
        'command' => [],
    ],
];
```

- `type` 为 Medoo 的驱动类型；带 `type` 的配置会原样传给 Medoo
- 兼容旧格式：无 `type` 时使用 `adapter`（默认 `mysql`）加 host/database/username/password 等字段
- `prefix` 会作用于表名；`option` 追加 PDO 属性；`command` 在连接后执行

注册：

```php
// config/service.php
return [
    \FastD\MedooDB\ServiceProvider\DatabaseServiceProvider::class,
];
```

## 最小示例

```php
$db = container()->get('medoodb')->getDatabase('default');

$db->insert('users', [
    'name' => 'fastd',
    'created_at' => date('c'),
]);

$users = $db->select('users', '*', [
    'status' => 1,
    'ORDER' => ['id' => 'DESC'],
    'LIMIT' => 20,
]);

$db->update('users', ['status' => 1], ['id' => 1]);
$db->delete('users', ['id' => 1]);
```

事务：

```php
try {
    $db->action(function ($db): void {
        $db->insert('orders', ['no' => 'A001']);
        $orderId = $db->id();

        $db->insert('order_items', ['order_id' => $orderId, 'sku' => 'P001']);

        // 抛异常即回滚
    });
} catch (Throwable $e) {
    // 处理失败
}
```

独立使用：

```php
use FastD\MedooDB\Database;

$db = new Database([
    'type' => 'sqlite',
    'database' => ':memory:',
]);
```

## 注意事项

- 构造函数把 PDO 设为 `ERRMODE_EXCEPTION` 和 `FETCH_ASSOC`；`EMULATE_PREPARES`、`STRINGIFY_FETCHES` 为尽力设置，SQLite 等驱动可能不支持。
- `query()` / `exec()` 捕获异常后会重连并重试一次，业务层仍需处理第二次失败。
- `getDatabase()` 按 key 缓存连接；`true` 会重建。连接失效（如 MySQL `server has gone away`）时用 `getDatabase($key, true)` 或 `reconnect()`。
- Swoole 启动阶段 `BootedEvent` 会调用 `initConnections()` 预建连接；连接在 fork 前创建，若遇到跨 worker 连接问题，优先在 worker 内重新获取/重连，不要把 PDO 实例传给其他 worker。
- SQLite `:memory:` 是连接级的：每次新建 `Database` 都是空库，测试中需重新建表；连接池里的同名连接可复用。
- 查询条件、JOIN、`LIMIT` 等使用 Medoo 语法。排序要写成 `'ORDER' => ['id' => 'DESC']`；写成 `'ORDER' => 'id DESC'` 会被当成单个列名并抛 `InvalidArgumentException`。
- `prefix` 由 Medoo 统一加在表名前，写原生 SQL 时要自行带前缀。
- 事务用 `action()`；回调内不要吞掉异常，否则不会回滚。
- SQLite 适合 Demo/测试；生产注意连接数、索引、慢查询与事务边界。

## 相关源码 / README

- [fastd/medoodb README](https://github.com/fastdlabs/medoodb/blob/master/README.md)
- [Medoo 文档](https://medoo.in/doc)
- [数据库](../guide/database.md)
- [组件总览](README.md)

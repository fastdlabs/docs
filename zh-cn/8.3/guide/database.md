# 数据库

FastD 使用 `fastd/medoodb`，基于 Medoo，提供连接池和 ServiceProvider。

## 安装

```bash
composer require fastd/medoodb
```

## 配置

`config/database.php`：

```php
return [
    'default' => [
        'type' => 'sqlite',
        'database' => __DIR__ . '/../runtime/demo.sqlite',
    ],
];
```

MySQL：

```php
'default' => [
    'type' => 'mysql',
    'host' => '127.0.0.1',
    'port' => 3306,
    'database' => 'app',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
],
```

## 注册

```php
// config/service.php
return [
    \FastD\MedooDB\ServiceProvider\DatabaseServiceProvider::class,
];
```

## 获取连接

```php
$db = container()->get('medoodb')->getDatabase('default');
```

连接池支持多连接；相同 key 复用连接，可强制重连：

```php
$db = pool->getDatabase('default', true);
```

## CRUD

```php
$db->insert('users', [
    'name' => 'fastd',
    'created_at' => date('c'),
]);

$users = $db->select('users', '*', [
    'status' => 1,
    'ORDER' => 'id DESC',
    'LIMIT' => 20,
]);

$db->update('users', ['status' => 1], ['id' => 1]);
$db->delete('users', ['id' => 1]);
```

## 事务

```php
try {
    $db->action(function ($db): void {
        $db->insert('orders', ['no' => 'A001']);
        $db->insert('order_items', ['order_no' => 'A001']);

        // 抛出异常即回滚
        // throw new RuntimeException('rollback');
    });
} catch (Throwable $e) {
    // 处理失败
}
```

## 注意

- Medoo 的查询条件和排序使用 Medoo 语法。
- SQLite 适合 Demo/测试；生产注意连接数、索引和事务边界。
- 不要在 Swoole worker 间共享同一个 PDO 连接。

组件细节见 [fastd/medoodb](../components/medoodb.md)。

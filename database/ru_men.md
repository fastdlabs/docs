# 入门

```php
'database' => [
    'write' => [
        'database_type'     => 'mysql',
        'database_host'     => '127.0.0.1',
        'database_port'     => 3306,
        'database_user'     => 'root',
        'database_pwd'      => '123456',
        'database_charset'  => 'utf8',
        'database_name'     => 'test',
        'database_prefix'   => ''
    ],
    'read' => [
        'database_type'     => 'mysql',
        'database_host'     => '127.0.0.1',
        'database_port'     => 3306,
        'database_user'     => 'root',
        'database_pwd'      => '123456',
        'database_charset'  => 'utf8',
        'database_name'     => 'test',
        'database_prefix'   => ''
    ],
],
```

次数数据库无论有一个，还是多个，均使用二维数组进行定义。

在控制器中，通过 `FastD\Framework\Bundle\Controllers\Controller::getDriver($name)` 进行获取.

```php

```
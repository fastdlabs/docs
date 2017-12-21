# ORM

FastD ORM 是基于 Eloquent 进行扩展的，因此在使用上与 Eloquent 是一致的，非常地简单易用。

### 安装

```php
$ composer require zqhong/fastd-eloquent
```

安装成功后，添加到 `app.php` 注册服务

```php
<?php
return [
    // 省略了无关配置
    'services' => [
        \ServiceProvider\EloquentServiceProvider::class,
    ],
];
```

### 使用

```php
<?php
// create
eloquent_db('default')
    ->table('demo')
    ->insert([
        'content' => 'hello world',
    ]);

// read
// 参数一可省略，默认值为 default
eloquent_db()
    ->table('demo')
    ->where('id', 1)
    ->where('created_at', '<=', time())
    ->get([
        'id',
        'content',
    ]);
```

### 其他相关资料

如果你对在其他框架中使用 Eloquent 感兴趣，请参考 Slim 的这篇文章 - [Using Eloquent with Slim。](https://www.slimframework.com/docs/cookbook/database-eloquent.html)

如果你对 Eloquent 不熟悉，请阅读下面的资料。

* Laravel - Database: Query Builder
* Laravel - Database: Pagination
* Laravel - Eloquent: Getting Started
* Laravel - Eloquent: Collections

开发者: [zqhong](https://github.com/zqhong/fastd-eloquent)

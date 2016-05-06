# 配置

框架中分为两种配置，一个是全局配置，全局配置根据运行环境而变化。另外一个则是模块配置，针对当前模块进行配置，也是模块独立的一部分。

全局配置文件: `app/config/config_(env).php`

模块配置文件: `{bundle}/Resources/config/config.php`

在系统引导的时候，系统会将所有配置文件进行合并，也就是如果配置文件中存在重复信息，则会被合并替代，所以在命名的时候要注意唯一性。

### 配置

配置的定义是用于程序上的读取，并对应执行操作，因此我们配置最大的作用就是改变程序不同的运行方式，达到定制化的目的。

例子，查看全局配置文件(dev): 

```php
<?php
return [
    // 数据库配置
    'database' => [
        'write' => [
            'type'     => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'user'     => 'root',
            'pwd'      => '',
            'charset'  => 'utf8',
            'dbname'     => '',
            'prefix'   => ''
        ],
        'read' => [
            'type'     => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'user'     => 'root',
            'pwd'      => '',
            'charset'  => 'utf8',
            'dbname'     => '',
            'prefix'   => ''
        ],
    ],
    // 存储配置
    'storage' => [
        'write' => [
            'type' => 'redis',
            'host' => '',
            'port' => 6379
        ],
    ],
];
```

我们在控制器中，可以通过 `Controller::getParameter($name)` 对配置文件进行读取。



#数据库配置

每个项目可能链接的数据不止一个，因此在此处设计是按照多库链接进行设计，同个仓库可以链接不同的数据连接，而数据连接在全局使用中是一个唯一对象，也就创建一次。

每个数据库链接配置针对不同环境设定，也就是开发，测试，生产环境的配置文件仅需要修改环境配置即可。

一般三个环境的设置为: 

```
public/dev.php // 开发环境，多指本地
public/test.php // 测试环境
public/prod.php // 生产环境，一般上线后不经常修改
```

数据库的配置文件也是根据这三者环境进行切换，对应配置文件: 

```
app/config/config_dev.php  // 开发环境配置
app/config/config_test.php // 测试环境配置
app/config/config_prod.php // 生产环境配置
```

数据库的配置信息均统一存储在字段 `database` 中，由链接名 `connection` 对应链接信息进行获取。如: 

```
return [
    // 数据库配置
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
];
```
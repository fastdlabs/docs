# 配置

#### 路由配置 

路由配置存放地址: `config/routes.php`

每个路由对应控制一个控制器，支持多种路由方式。

```php
<?php

route()->get('/', 'WelcomeController@welcome');
route()->get('/hello/{name}', 'WelcomeController@sayHello');

```

更多详细配置请前往: [路由与控制器](zh-cn/basic/2-2-routing-and-controllers.md)

#### 应用配置

应用配置则是整体核心配置的集合，包括时区，环境，日志，服务提供器，中间件等等，可以通过自定义 [服务提供器](zh-cn/basic/3-8-service-provider.md) 来读取具体的配置内容。

!> 系统默认配置项请勿随意删除。`services` 默认内置的服务，如果在不了解的情况下，请勿随意改变顺序，如果需要添加自定义的，请在最后一项后添加。

```php
<?php
return [
    /**
     * The application name.
     */
    'name' => 'dobee',

    /*
     * Application logger path
     */
    'log' => [
        [\Monolog\Handler\StreamHandler::class, 'error.log', \Monolog\Logger::ERROR]
    ],

    /*
     * Exception handle
     */
    'exception' => [
        'response' => function (Exception $e) {
            return [
                'msg' => $e->getMessage(),
                'code' => $e->getCode(),
            ];
        },
        'log' => function (Exception $e) {
            return [
                'msg' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
            ];
        },
    ],

    /**
     * Bootstrap service.
     */
    'services' => [
        \FastD\ServiceProvider\RouteServiceProvider::class,
        \FastD\ServiceProvider\LoggerServiceProvider::class,
        \FastD\ServiceProvider\DatabaseServiceProvider::class,
        \FastD\ServiceProvider\CacheServiceProvider::class,
    ],

    /**
     * Application consoles
     */
    'consoles' => [],

    /**
     * Http middleware
     */
    'middleware' => [
        
    ],
];
```

#### 服务器配置

服务器配置主要用于 `swoole` 服务器处理上，用于配置基础 ip、端口等信息，一起启动的服务器类型。

服务器配置项 host 是必填的，是 Swoole 服务器监听的地址。`options` 配置项请查看 [Swoole配置](http://wiki.swoole.com/wiki/page/274.html)

**完整的配置**

```php
<?php
return [
    'host' => get_local_ip().':9527',
    'class' => \FastD\Servitization\Server\HTTPServer::class,
    'options' => [
        'pid_file' => '',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [
        
    ],
    'listeners' => [
        
    ],
];
```

`class` 配置项用于配置启动的服务器类型，可以自定义具体服务器。具体文档: [自定义服务器](zh-cn/swoole/8-5-custom-server)

`options` 配置项与 `swoole` 保持一致，请参考: [配置项](https://wiki.swoole.com/wiki/page/274.html)

`processes` 配置项作用于服务器的进程处理。例如:启动服务后，使用进程定时检测服务器状态。官方地址: [swoole_server->addProcess](https://wiki.swoole.com/wiki/page/390.html)

`listeners` 配置项作用于服务多端口监听上。例如: 开启HTTP服务器，并且开放 TCP 端口进行监听。官方地址: [swoole_server->listen](https://wiki.swoole.com/wiki/page/367.html)

#### 进程配置

3.2 版本新增进程管理，新增: `config/process.php`。

```php
<?php

return [
    'demo' => \Process\DemoProcess::class
];
```

通过命令快速管理 php 进程。

命令: 

```php
$ php bin/console process
```

启动我们的命令。

```php
$ php bin/console process demo start
```

停止命令。

```php
$ php bin/console process demo stop
```

#### 缓存配置

缓存配置目前支持文件缓存、redis 缓存两种，由 symfony/cache 提供。

缓存配置的不同点在于适配器，当使用文件缓存的时候，需要修改适配器为文件系统，如此类推。

通过 `params` 配置项来配置缓存适配器的初始参数。

文件缓存配置

```php
<?php

return [
    'default' => [
        'adapter' => \Symfony\Component\Cache\Adapter\FilesystemAdapter::class,
        'params' => [
        ],
    ]
];
```

Redis 缓存配置

```php
<?php

return [
    'default' => [
        'adapter' => \Symfony\Component\Cache\Adapter\RedisAdapter::class,
        'params' => [
            'dsn' => 'redis://localhost:3306/db',
        ],
    ],
];
```

> 缓存此处使用 dsn 形式进行配置，因此写法需要按照规范进行填写，如: `redis://user:pass@host:port/db`

#### 数据库配置

框架支持多个数据库配置，如果在应用中有可能使用多个连接的话，就可以利用该特性，满足业务需求，默认选择连接项: `default`。

> 如果不需要数据操作的话，可以清空配置文件: `<?php return [];`

```php
<?php

return [
    'default' => [
        'adapter' => 'mysql',
        'name' => 'ci',
        'host' => '127.0.0.1',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8',
        'port' => 3306,
    ]
];
```

#### 自定义配置

为了不打乱默认的 `app.php`，框架提供了 `config.php` 扩展配置文件，自定义配置推荐使用 `config.php` 进行配置。

#### 配置文件查看命令

```php
$ php bin/console config
```

查看单个配置文件。

```php
$ php bin/console config app
```

下一节: [路由与控制器](zh-cn/basic/2-2-routing-and-controllers.md)

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

!> 系统默认配置项请勿随意删除。

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
        'basic.auth' => new FastD\BasicAuthenticate\HttpBasicAuthentication([
            'authenticator' => [
                'class' => \FastD\BasicAuthenticate\PhpAuthenticator::class,
                'params' => [
                    'foo' => 'bar'
                ]
            ],
            'response' => [
                'class' => \FastD\Http\JsonResponse::class,
                'data' => [
                    'msg' => 'not allow access',
                    'code' => 401
                ]
            ]
        ])
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

#### 缓存配置

#### 数据库配置

#### 自定义配置

下一节: [路由与控制器](zh-cn/basic/2-2-routing-and-controllers.md)

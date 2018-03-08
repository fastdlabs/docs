# Configure

#### Routing configuration

Routing configuration storage address: `config/routes.php`

Each route corresponds to control a controller, supports a variety of routing methods.

```php
<?php

route()->get('/', 'WelcomeController@welcome');
route()->get('/hello/{name}', 'WelcomeController@sayHello');
```

For more detailed configuration go to: [Routing and Controllers](en-us/3.2/basic/2-2-routing-and-controllers.md)

#### Application Configuration

Application Configuration is a collection of the overall core configuration, including time zone, environment, log, service providers, middleware, etc., can be customized by [Service Provider](en-us/3.2/advanced/3-3-service-provider.md) to read the specific configuration.

!> Do not delete the system default configuration items. `services` default built-in services, if you do not understand, do not change the order, if you need to add a custom, please add after the last one.

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

#### server configuration

Server configuration is mainly used for `swoole` server processing, used to configure the basic ip, port and other information, together with the type of server started.

The server configuration item host is required and is the address that Swoole server listens on. `options` configuration items, please see [Swoole Configuration](http://wiki.swoole.com/wiki/page/274.html)

**complete configuration**

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

The `class` configuration item is used to configure the type of server to be started. You can customize a specific server. Specific Documents: [Custom Server](en-us/3.2/swoole/8-5-custom-server.md)

The `options` configuration is consistent with` swoole`, see: [Configuration Items](https://wiki.swoole.com/wiki/page/274.html)

Processes configuration process on the role of the server process. For example: After starting the service, use process timing to check server status. Official Address: [swoole_server->addProcess](https://wiki.swoole.com/wiki/page/390.html)

`listeners` configuration items on the service multi-port snooping. For example: Open the HTTP server, and open the TCP port for monitoring. Official Address: [swoole_server->listen](https://wiki.swoole.com/wiki/page/367.html)

#### process configuration

3.2 version of the new process management, add: `config/process.php`.

```php
<?php

return [
    'demo' => \Process\DemoProcess::class
];
```

Through the command to quickly manage the php process.

Command:

```php
$ php bin/console process
```

Start our command.

```php
$ php bin/console process demo start
```

Stop the command.

```php
$ php bin/console process demo stop
```

#### Cache Configuration

Cache configuration currently supports file cache, redis cache, provided by symfony/cache.

The difference between the cache configuration is the adapter, when using the file cache, you need to modify the adapter for the file system, and so on.

Use the params configuration item to configure the initial parameters of the cache adapter.

File cache configuration

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

Redis cache configuration

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

> Caching here using the dsn form of configuration, the wording needs to be filled according to the specification, such as: `redis://user:pass@host:port/db`

#### Database Configuration

The framework supports multiple database configurations that can be leveraged to meet business needs by default if you have multiple connections in your application.

> If you do not need data manipulation, you can empty the configuration file: `<? Php return [];`

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

#### Custom configuration

In order not to disrupt the default `app.php`, the framework provides the `config.php` extension configuration file. It is recommended to use `config.php` for custom configuration.

#### Configuration File View Commands

```php
$ php bin/console config
```

View a single profile.

```php
$ php bin/console config app
```

Next: [Routing and Controllers] (en-us/3.2/basic/2-2-routing-and-controllers.md)
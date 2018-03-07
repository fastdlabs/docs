# Apply the configuration

Application configuration is divided into 3 configuration types

1. Basic configuration
Server configuration
3 custom configuration

The basic configuration consists of:

1 routing configuration
2. Application Configuration

Composition, are stored basic business configuration and routing access to the place.

##### Routing configuration

Routing configuration is the specific routing configuration information, please go to: [Routing and Controller] (zh-cn / 3.1 / 2-1-routing-and-controllers.md)

##### Application Configuration

The application configuration is a collection of the overall core configuration, including the time zone, environment, log, service providers, middleware, etc., can be read by custom [Service Provider] (3-8-service-provider.md) The configuration content.

For more information, check out: [app.php] (../../ tests / app / default / config / app.php)

User-defined configuration can be set [config.php] (../../ tests / app / default / config / config.php) configuration items here will be merged into the app.php configuration, because you can not duplicate configuration item.

** Complete Configuration Item **

`` `php
<? php
return [
    / **
     * The application name.
     * /
    'name' => 'dobee',

    / *
     * Application logger path
     * /
    'log' => [
        [\ Monolog \ Handler \ StreamHandler :: class, 'error.log', \ Monolog \ Logger :: ERROR]
    ],

    / *
     * Exception handle
     * /
    'exception' => [
        'response' => function (Exception $ e) {
            return [
                'msg' => $ e-> getMessage (),
                'code' => $ e-> getCode (),
                'file' => $ e-> getFile (),
                'line' => $ e-> getLine (),
                'trace' => explode ("\ n", $ e-> getTraceAsString ()),
            ];
        },
    ],

    / **
     * Bootstrap service.
     * /
    'providers' => [
        \ FastD \ ServiceProvider \ RouteServiceProvider :: class,
        \ FastD \ ServiceProvider \ LoggerServiceProvider :: class,
        \ FastD \ ServiceProvider \ DatabaseServiceProvider :: class,
        \ FastD \ ServiceProvider \ CacheServiceProvider :: class,
    ],

    / **
     * Application consoles
     * /
    'consoles' => [],

    / **
     * Http middleware
     * /
    'middleware' => [
        'basic.auth' => new FastD \ BasicAuthenticate \ HttpBasicAuthentication ([
            'authenticator' => [
                'class' => \ FastD \ BasicAuthenticate \ PhpAuthenticator :: class,
                'params' => [
                    'foo' => 'bar'
                ]
            ],
            'response' => [
                'class' => \ FastD \ Http \ JsonResponse :: class,
                'data' => [
                    'msg' => 'not allow access',
                    'code' => 401
                ]
            ]
        ])
    ],
];
`` `

** !! default configuration items please do not delete **

##### server configuration

The server configuration item host is required and is the address that Swoole server listens on. `options` configuration items, please see [Swoole Configuration] (http://wiki.swoole.com/wiki/page/274.html)

** complete configuration **

`` `php
<? php
return [
    'host' => 'http: //'.get_local_ip ().': 9527 ',
    'class' => \ FastD \ Servitization \ Server \ HTTPServer :: class,
    'options' => [
        'pid_file' => '',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [
        
    ],
    'listeners' => [
        [
            'class' => \ FastD \ Servitization \ Server \ TCPServer :: class,
            'host' => 'tcp: //'.get_local_ip ().': 9528 ',
        ],
    ],
];
`` `

##### Custom configuration items

[database.php] (../../ tests / app / default / config / database.php) and [cache.php] (../../ tests / app / default / config / cache.php) are Extensions provided by default by the framework are handled by [DatabaseServiceProvider] (../../ src / ServiceProvider / DatabaseServiceProvider.php) and [CacheServiceProvider] (../../ src / ServiceProvider / CacheServiceProvider.php).

Where database.php and cache.php although the framework provided by default, but they belong to one of the custom service providers.

If you need to add or modify custom service providers, please refer to: [Service Provider] (en-us / 3.1 / 3-8-service-provider.md)

Next Section: [Middleware] (en-us / 3.1 / 3-2-middleware.md)
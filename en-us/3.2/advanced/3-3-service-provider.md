# Service provider

The service provider provides custom extensions and handles for the import, depending on the [container](https://github.com/JanHuang/container)

Each provider needs to implement the `FastD\Container\ServiceProviderInterface` interface, implement the` register` method, and handle service provisioning.

### Custom Service Provider

Services provided by the service provider is global, so you need to make good use of this feature, try to write some services that can be used globally, and finally the service provider will be injected into the Containers.

#### achieve `register` method

```php
<?php

namespace FastD\ServiceProvider;

use FastD\Container\Container;
use FastD\Container\ServiceProviderInterface;
use FastD\Pool\DatabasePool;

/**
 * Class DatabaseServiceProvider.
 */
class DatabaseServiceProvider implements ServiceProviderInterface
{
    /**
     * @param Container $container
     * @return mixed
     */
    public function register(Container $container)
    {
        $config = config()->get('database', []);

        $container->add('database', new DatabasePool($config));

        unset($config);
    }
}
```

#### into the container

Written service provider, need to do the final step is to inject into the global container.

Modify the `config/app.php` configuration file and append the server provider.

```php
<?Php

return [
    // some code
    'services' => [
        \FastD\ServiceProvider\RouteServiceProvider::class,
        \FastD\ServiceProvider\LoggerServiceProvider::class,
        \FastD\ServiceProvider\DatabaseServiceProvider::class,
        \FastD\ServiceProvider\CacheServiceProvider::class,
        // 在此追加        
    ],
    // some code
];
```

!> Do not delete the system default configuration items. `services` default built-in services, if you do not understand, do not change the order, if you need to add a custom, please add after the last one.

### Built-in command line

When our service provider comes with a command line and does not want the user to manually add it, it can be handled internally by the service provider.

Because command-line tools use `config()->get('consoles', [])` or presets, this form can be built-in when registering a service provider.

Example:

```php
<?php

namespace FastD\ServiceProvider;

use FastD\Container\Container;
use FastD\Container\ServiceProviderInterface;
use FastD\Pool\DatabasePool;

/**
 * Class DatabaseServiceProvider.
 */
class DatabaseServiceProvider implements ServiceProviderInterface
{
    /**
     * @param Container $container
     * @return mixed
     */
    public function register(Container $container)
    {
        config()->merge([
            'consoles' => [
                // 预置命令
            ],
        ]);
    }
}
```

By command `$ php bin/console` you can get the preset command.

Next Section: [Swoole Server](en-us/3.2/advanced/3-4-extend.md)
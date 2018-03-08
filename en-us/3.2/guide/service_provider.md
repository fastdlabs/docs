# Service provider

Why fastd is so powerful and flexible, and more because of the presence of service providers, gives users the flexibility and freedom to create their own wheels and seamlessly integrate them, and for that we also have plenty of wheels built for efficiency.

The steps to create a service provider are as follows:

1. Create a service object
2. Register to configure

## Install Existing Provider

```shell
$ composer require fastd/viewer -vvv
```

After the installation is complete, register the service provider into the configuration

```php
<?php

return [
    /**
     * Bootstrap service.
     */
    'services' => [
        \FastD\ServiceProvider\RouteServiceProvider::class,
        \FastD\ServiceProvider\LoggerServiceProvider::class,
        \FastD\ServiceProvider\DatabaseServiceProvider::class,
        \FastD\ServiceProvider\CacheServiceProvider::class,
        \FastD\ServiceProvider\MoltenServiceProvider::class,
        // 添加到配置
        \FastD\Viewer\Viewer::class,
    ],
];
```

!> If you are not familiar with the framework of the implementation process, it is recommended to append to the existing service provider behind.

## Implementing a Service Provider

Service providers can help us add command line, middleware, routing, or even change the application's startup process, to achieve the purpose of free expansion and adjustment.

If we need to add more than one configuration file, but do not want to be modified in the configuration file, then the service provider can help you:

Implementation: `\FastD\Container\ServiceProviderInterface::register(\FastD\Container\Container $container)`

```php
<?php

namespace ServiceProvider;


use FastD\Container\Container;
use FastD\Container\ServiceProviderInterface;

class HelloServiceProvider implements ServiceProviderInterface
{
    /**
     * @param Container $container
     * @return mixed
     */
    public function register(Container $container)
    {
        config()->load(app()->getPath().'/config/custom.php');
    }
}
```

See if the adjustments we added are valid:

```shell
$ php bin/console config custom.php
```

```json
{
    "foo": "bar"
}
```

At this point, you have learned how to build your own service provider.

> If necessary, package the tool into a service provider and register it with the configuration as described above.
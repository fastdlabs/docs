# 服务提供器

服务提供器提供了自定义扩展和处理的入口，实现依赖于 [container](https://github.com/JanHuang/container)

每个提供器都需要实现 `FastD\Container\ServiceProviderInterface` 接口，实现 `register` 方法并处理服务提供。

### 自定义服务提供器

服务提供器所提供的服务是全局的，所以需要利用好这个特性，尽量编写一些全局都能用到的服务，另外服务提供器最终会注入到 `Application` 容器 `Containaer` 当中。

#### 实现 `register` 方法

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

#### 注入容器

编写完的服务提供器，需要做最后一步，就是注入到全局容器中。

修改 `config/app.php` 配置文件，追加服务器提供器。

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

!> 系统默认配置项请勿随意删除。`services` 默认内置的服务，如果在不了解的情况下，请勿随意改变顺序，如果需要添加自定义的，请在最后一项后添加。

### 内置命令行

当如果我们的服务提供器带有命令行，而又不想让用户手动添加，可以通过服务提供器内部注册的方式进行处理。

因为命令行工具使用 `config()->get('consoles', [])` 或者预置命令，因此利用该形式，能够在注册服务提供器的时候内置。

示例:

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

通过命令 `$ php bin/console` 即可获取预置的命令。

下一节: [Swoole服务器](zh-cn/advanced/3-3-extend.md)

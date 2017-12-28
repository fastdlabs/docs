# 服务提供器

fastd 为何如此强大与灵活，更多是因为有服务提供器的存在，因此用户可以很灵活很自由地创造自己的轮子并且无缝整合，为此，我们也内置了很多提高效率的轮子。

创建服务提供器步骤如下:

1. 创建服务对象
2. 注册到配置

## 安装已有提供器

```shell
$ composer require fastd/viewer -vvv
```

安装完毕之后，将服务提供器注册到配置当中

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

!> 如果对于框架执行流程不是很熟悉的朋友，建议追加到已存在服务提供器的后面。 

## 实现服务提供器

服务提供器可以帮助咱们添加命令行，中间件，路由，甚至可以改变应用程序的启动流程，达到自由扩展与调整的目的。

假如我们需要添加多一个配置文件，但是又不想在配置文件中进行修改，那么服务提供器就可以帮到你:

实现: `\FastD\Container\ServiceProviderInterface::register(\FastD\Container\Container $container)`

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

查看我们添加的调整是否有效:

```shell
$ php bin/console config custom.php
```

```json
{
    "foo": "bar"
}
```

至此，你已经学会了如何构建自己服务提供器了。

> 如果有需要将工具打包成服务提供器，然后根据上述步骤注册到配置中即可。

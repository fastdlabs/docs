# 缓存配置

位置: `config/cache.php`。由 `\FastD\ServiceProvider\CacheServiceProvider` 服务提供器初始化。

核心代码:

```php
<?php

class CacheServiceProvider implements ServiceProviderInterface
{
    public function register(Container $container)
    {
        $config = $container->get('config')->get('cache');

        $container->add('cache', new CachePool($config));

        unset($config);
    }
}
```

配置文件默认使用文件存储，由 [symfony/cache](http://symfony.com/doc/current/components/cache.html) 提供操作API，更多的支持操作及处理可以查看官方文档说明。

配置信息:

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

在选择缓存驱动的时候，如果是选择文件存储，params 参数需要保持为空，且不能删除或者注释。

 ### 多个缓存配置

缓存服务支持多个配置，默认使用 `default` 连接。

代码:

```php
<?php

return [
    'default' => [
        'adapter' => \Symfony\Component\Cache\Adapter\FilesystemAdapter::class,
        'params' => [
        ],
    ],
    'file' => [
        'adapter' => \Symfony\Component\Cache\Adapter\FilesystemAdapter::class,
        'params' => [
        ],
    ],
];
```

利用 `cache` 函数，填写参数选择连接，默认 `default`。如: `cache('file')` 选择 `file` 连接项。

### 基础使用

无论是使用文件缓存，redis缓存，使用和操作方式都是保持一致的，仅仅是适配器的改变而已。

```php
$cache = cache();

$numProducts = $cache->getItem('stats.num_products');

// assign a value to the item and save it
$numProducts->set(4711);
$cache->save($numProducts);

// retrieve the cache item
$numProducts = $cache->getItem('stats.num_products');
if (!$numProducts->isHit()) {
 // ... item does not exists in the cache
}
// retrieve the value stored by the item
$total = $numProducts->get();

// remove the cache item
$cache->deleteItem('stats.num_products');
```
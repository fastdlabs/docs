# Cache configuration

Location: `config / cache.php`. Initialized by `\ FastD \ ServiceProvider \ CacheServiceProvider` service provider.

Core code:

`` `php
<? php

class CacheServiceProvider implements ServiceProviderInterface
{
    public function register (Container $ container)
    {
        $ config = $ container-> get ('config') -> get ('cache');

        $ container-> add ('cache', new CachePool ($ config));

        unset ($ config);
    }
}
`` `

By default, the configuration file is stored as a file, and the operation API is provided by [symfony / cache] (http://symfony.com/doc/current/components/cache.html). For more support and handling, you can check the official documentation.

Configuration Information:

`` `php
<? php

return [
    'default' => [
        'adapter' => \ Symfony \ Component \ Cache \ Adapter \ FilesystemAdapter :: class,
        'params' => [
        ],
    ]
];
`` `

In the choice of cache-driven, if it is to choose file storage, params parameters need to be kept blank, and can not delete or comment.

 ### Multiple cache configurations

Cache service supports multiple configurations, the default `default` connection.

Code:

`` `php
<? php

return [
    'default' => [
        'adapter' => \ Symfony \ Component \ Cache \ Adapter \ FilesystemAdapter :: class,
        'params' => [
        ],
    ],
    'file' => [
        'adapter' => \ Symfony \ Component \ Cache \ Adapter \ FilesystemAdapter :: class,
        'params' => [
        ],
    ],
];
`` `

Use the `cache` function, fill in the parameters to select the connection, the default` default`. Such as: `cache ('file')` select `file` connection.

### basic use

Whether using file caching, redis caching, usage, and mode of operation are all consistent, just the adapter changes.

`` `php
$ cache = cache ();

$ numProducts = $ cache-> getItem ('stats.num_products');

// assign a value to the item and save it
$ numProducts-> set (4711);
$ cache-> save ($ numProducts);

// retrieve the cache item
$ numProducts = $ cache-> getItem ('stats.num_products');
if (! $ numProducts-> isHit ()) {
 // ... item does not exist in the cache
}
// retrieve the value stored by the item
$ total = $ numProducts-> get ();

// remove the cache item
$ cache-> deleteItem ('stats.num_products');
`` `
# Cache

Cache service providers and components rely mainly on: [Symfony Cache] (http://symfony.com/doc/current/components/cache.html), the specific operation is consistent.

Provide a helper function: `cache ()`, which returns the original `Symfony \ Component \ Cache \ Adapter \ AbstractAdapter` object. Currently supports file cache, Redis cache, welcome to provide all kinds of cache providers.

> Starting with version 3.1, use a two-dimensional array for configuration

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

Function will be configured according to the configuration of the cache to read, `adapter` adapter is a required parameter,` params` remains empty, select the file cache.

#### Redis cache

`` `php
<? php
return [
    'default' => [
        'adapter' => \ Symfony \ Component \ Cache \ Adapter \ RedisAdapter :: class,
        'params' => [
            'dsn' => 'redis: // pass @ host / dbindex',
        ],
    ]
];
`` `

Just by configuring the `dsn` option, the redis adapter handles the connection automatically.
 
 #### operation
 
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


Next Section: [Command Line] (en-us / 3.1 / 3-5-console.md)
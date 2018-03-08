# Upgrade Guide

> v3.1 -> v3.2

** Seamless upgrade **

!> v3.0 -> v3.1
1. To adjust the configuration file `config/cache.php` and `config/database.php` one-dimensional array into a two-dimensional array

##### cache.php

```php
<?php
return [
    'default' => [
        'adapter' => \Symfony\Component\Cache\Adapter\FilesystemAdapter::class,
        'params' => [
        ],
    ],
];
```

##### database.php

```php
<?php
return [
    'default' => [
        'adapter' => 'mysql',
        'name' => 'ci',
        'host' => '127.0.0.1',
        'user' => 'travis',
        'pass' => '',
        'charset' => 'utf8',
        'port' => 3306,
    ]
];
```

2. Adjust the built-in server namespace and object name,

3. Change the directory `Http/Controller` to `Controller` and the namespace to `Controller`

4. Application log configuration changes to an array:

```php
<?php

return [
    // ...
    'log' => [
        [\ Monolog\Handler\StreamHandler :: class, 'error.log',\Monolog\Logger :: ERROR],
        [\ Monolog\Handler\StreamHandler :: class, 'access.log',\Monolog\Logger :: INFO],
    ],
    // ...
];
```

5. Unit test base class namespace modify `FastD\Test\TestCase` => `FastD\TestCase`
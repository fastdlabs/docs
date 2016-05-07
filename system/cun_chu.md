# 存储

此处存储将 `Memcached`，`Redis`，`SSDB`，整合到一起，并且自身提供原生操作，所以在原身的的封装并没有冲突，这也是为了灵活扩展做的准备，也可能正因为小弟能力有限精力有限，暂时没有研究太多的功能，所以暂时听到简单封装和原生操作，方便开发者使用

在使用前，不要忘记安装好对应的 PHP 扩展。

### ＃Memcached

```php
$memcached = new Memcached([
    'host' => '',
    'port' => ''
]);
```

实例化一个已经封装好的 `Memcached`，直接使用方法对 `memcached` 进行操作。

##### ＃使用原生对象操作

```php
$memcached = Memcached::connect([
    'host' => '',
    'port' => ''
]);
```

连接 `Memcached` 后，就可以使用原生的操作对其进行操作了，过程中没有对 `Memcached` 进行封装，所以使用上和扩展是一模一样，可以说，这就是扩展对象(`\Memcached`)。

### ＃Redis

```php
use FastD\Storage\Redis\Redis;

$redis = new Redis([
    'host' => '',
    'port' => '',
    'auth' => ''
]);

$redis->set($name, $value, $ttl = 0);

$redis->get($name);
```

获取 Redis 与原生对象，保持使用上的灵活。


```php
use FastD\Storage\Redis\Redis;

$redis = Redis::connect([
    'host' => '',
    'port' => '',
    'auth' => ''
]);

// 原生 redis 操作

$redis->mset($name, $value);
```


### ＃SSDB

```php
use FastD\Storage\Ssdb\Ssdb;

$ssdb = new Ssdb([
    'host' => '',
    'port' => ''
]);
```

原生操作

```php
use FastD\Storage\Ssdb\Ssdb;

$ssdb = Ssdb::connect([
    'host' => '',
    'port' => ''
]);
```
# 存储

此处存储将 `Memcached`，`Redis`，`SSDB`，整合到一起，并且自身提供原生操作，所以在原身的的封装并没有冲突，这也是为了灵活扩展做的准备，也可能正因为小弟能力有限精力有限，暂时没有研究太多的功能，所以暂时听到简单封装和原生操作，方便开发者使用

### ＃Memcached

```php
$memcached = new Memcached([
    'host' => '11.11.11.44',
    'port' => '11211'
]);

$memcached->set('age', '18');

```

### ＃Redis

### ＃SSDB

# 缓存

FastD 缓存组件基于 Symfony Cache，提供缓存池和 HTTP 缓存中间件。

## 安装

```bash
composer require fastd/cache
```

## 配置

`config/cache.php`：

```php
return [
    'file' => [
        'adapter' => [
            'class' => \Symfony\Component\Cache\Adapter\FilesystemAdapter::class,
            'dsn' => null,
        ],
        'namespace' => 'app',
        'lifetime' => 3600,
        'directory' => __DIR__ . '/../runtime/cache',
    ],
];
```

Redis：

```php
'redis' => [
    'adapter' => [
        'class' => \Symfony\Component\Cache\Adapter\RedisAdapter::class,
        'dsn' => 'redis://127.0.0.1:6379/0',
        'options' => [],
    ],
    'namespace' => 'app',
    'lifetime' => 3600,
],
```

## 注册 ServiceProvider

```php
// config/service.php
return [
    \FastD\Cache\ServiceProvider\CacheServiceProvider::class,
];
```

## 使用

```php
$cache = cache('file');
$item = $cache->getItem('user_1');

if (!$item->isHit()) {
    $item->set(['name' => 'fastd']);
    $item->expiresAfter(3600);
    $cache->save($item);
}

$user = $item->get();
```

## 删除 / 命中判断

```php
$cache->deleteItem('user_1');

$item = $cache->getItem('user_1');
$item->isHit(); // false
```

## HTTP 缓存中间件

`fastd/cache` 提供 `XMCache` 中间件，用于缓存 GET 200 响应：

```php
// config/cache.php
'httpCache' => [
    'lifetime' => 3600,
    'cache_keys' => ['page', 'limit'],
],
```

注册服务提供者后，由中间件按 URL/查询参数生成缓存键；响应会带 `X-M-Cache-Status: HIT|MISS`。

## 平台差异

- 文件缓存适合 CGI / 单机。
- Redis 适合多实例、共享缓存。
- Swoole 下可使用共享内存/进程内缓存，但要注意 worker 间一致性。

组件细节见 [fastd/cache](../components/cache.md)。

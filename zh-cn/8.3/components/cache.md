# fastd/cache

FastD 8.3 生态中的缓存组件（8.1 版本线），基于 Symfony Cache，提供缓存池、连接复用和 HTTP 页面缓存中间件。

## 用途与定位

- `CachePool` 管理多个缓存池（file / php / redis / memcached），按名称复用适配器
- `cache($name)` 助手返回 PSR-6 缓存池，直接使用 Symfony 的 `getItem()` / `save()` API
- `XMCache` 中间件缓存 GET 200 响应，命中时直接返回并带 `X-M-Cache-Status`
- Swoole 启动时预建 Redis/Memcached 连接

## 安装

```bash
composer require fastd/cache
```

依赖 `symfony/cache ^8.0`；PHP >= 8.4.1。Redis/Memcached 适配器需要对应扩展与服务。

## 核心 API / 类

| 类 / 方法 | 说明 |
|---|---|
| `cache(string $name): AbstractAdapter` | 助手函数，取 `cache` 服务中的指定缓存池 |
| `FastD\Cache\CachePool::getCache(string $key)` | 获取（并缓存）适配器 |
| `CachePool::getAdapter(string $key)` | 按配置创建适配器 |
| `CachePool::connect(string $key)` | 为带 `adapter.dsn` 的池建立/复用连接 |
| `CachePool::initConnections()` | 初始化所有带 `dsn` 的连接（Swoole Booted 阶段调用） |
| `FastD\Cache\ServiceProvider\CacheServiceProvider` | 注册 `cache` 服务并挂载 `BootedEventListener` |
| `FastD\Cache\ServiceProvider\ServerRequestCacheProvider` | 按 `enable` 配置把 `XMCache` push 到 `matcher` |
| `FastD\Cache\Middleware\XMCache` | HTTP 缓存中间件，缓存池名固定为 `xmCache` |
| `FastD\Cache\Listener\BootedEventListener` | Swoole 运行时调用 `initConnections()` |

## 配置

`config/cache.php` 中每个顶层键就是一个缓存池：

```php
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\Adapter\PhpFilesAdapter;
use Symfony\Component\Cache\Adapter\RedisAdapter;

return [
    'file' => [
        'adapter' => ['class' => FilesystemAdapter::class],
        'namespace' => '',
        'lifetime' => 3600,
        'directory' => __DIR__ . '/../runtime/cache/',
    ],

    'php' => [
        'adapter' => ['class' => PhpFilesAdapter::class],
        'lifetime' => 3600,
        'directory' => __DIR__ . '/../runtime/cache/php/',
    ],

    'redis' => [
        'adapter' => [
            'class' => RedisAdapter::class,
            'dsn' => 'redis://127.0.0.1:6379/0',
            'options' => [],
        ],
        'namespace' => '',
        'lifetime' => 3600,
    ],

    // HTTP 缓存池：XMCache::CacheName 固定为 xmCache
    'xmCache' => [
        'enable' => true,
        'adapter' => ['class' => FilesystemAdapter::class],
        'lifetime' => 60,
        'directory' => __DIR__ . '/../runtime/cache/http/',
        'cache_keys' => ['page', 'limit'],
    ],
];
```

- `adapter.class`（必填）、`adapter.dsn`、`adapter.options`、`namespace`、`lifetime`、`directory`
- `cache_keys` 只对 `XMCache` 生效，决定哪些查询参数参与缓存键
- `enable` 由 `ServerRequestCacheProvider` 判断，非真值不会注册中间件

注册服务：

```php
// config/service.php
return [
    \FastD\Cache\ServiceProvider\CacheServiceProvider::class,
    // 需要 HTTP 缓存时追加：
    \FastD\Cache\ServiceProvider\ServerRequestCacheProvider::class,
];
```

`XMCache` 读取策略配置时优先 `cache.httpCache`，不存在则回退 `cache.xmCache`；但实际缓存池始终是 `xmCache`。

## 最小示例

```php
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

// 普通缓存池
$cache = cache('file');
$item = $cache->getItem('user_1');

if (!$item->isHit()) {
    $item->set(['name' => 'fastd'])->expiresAfter(600);
    $cache->save($item);
}

$user = $item->get();
$cache->deleteItem('user_1');
```

HTTP 缓存：`xmCache.enable = true` 并注册 `ServerRequestCacheProvider` 后，GET 200 响应会自动缓存；响应头：

```text
X-M-Cache: mc1234567890
X-M-Cache-Status: MISS   # 首次
X-M-Cache-Status: HIT    # 命中
Expires: Wed, 29 Oct 2026 12:00:00 GMT
```

也可以手动把中间件加入全局链：

```php
$container->get('matcher')->push(new \FastD\Cache\Middleware\XMCache());
```

## 注意事项

- 只缓存 GET 且状态码为 200 的响应；`StreamingResponseInterface`（SSE 等）不缓存。
- 请求带 `Authorization`、`Cookie`、`Cache-Control: no-store/no-cache` 时直接放行；响应带 `Set-Cookie`、`private`、`no-store` 或 `Vary: Cookie/Authorization` 时也不缓存。
- 缓存键由 path + `cache_keys` 指定的查询参数 + 版本号 1 生成 CRC32（前缀 `mc`）；请求头 `X-M-Cache` 可指定已有键。
- `XMCache` 固定调用 `cache('xmCache')`，配置里必须有 `xmCache` 池；只写 `httpCache` 而没有 `xmCache` 会在运行时取不到池。
- `ServerRequestCacheProvider` 先读 `httpCache`，不存在时回退 `xmCache`，只有其 `enable` 为真才注册中间件。
- FastD 不加载 `config/middleware.php`；全局中间件用 `ServerRequestCacheProvider` 或手动 `matcher->push()`。
- `CacheServiceProvider` 依赖容器的 `config` 服务；`cache()` 还依赖 `container()` 助手（即 `fastd/fastd`）。
- 带 `dsn` 的池只支持 `redis`、`rediss`、`memcached`，其他 scheme 会抛 `InvalidArgumentException`；Swoole 启动时由 `BootedEventListener` 预建连接。
- 文件缓存目录必须可写；多机部署请使用 Redis/Memcached，不要依赖本地文件一致性。
- HTTP 缓存是页面级的，不要对登录态、个性化或写操作路由开启。

## 相关源码 / README

- [fastd/cache README](https://github.com/fastdlabs/cache/blob/master/README.md)
- [缓存](../guide/cache.md)
- [Session](../guide/session.md)
- [组件总览](README.md)

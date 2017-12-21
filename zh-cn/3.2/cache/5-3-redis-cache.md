# Redis 缓存

目前支持文件缓存、redis 缓存，实现代码如下:

```php

namespace FastD\Pool;

use Symfony\Component\Cache\Adapter\AbstractAdapter;
use Symfony\Component\Cache\Adapter\RedisAdapter;

/**
 * Class CachePool.
 */
class CachePool implements PoolInterface
{
    /**
     * @var AbstractAdapter[]
     */
    protected $caches = [];

    /**
     * @var array
     */
    protected $config;

    /**
     * Cache constructor.
     *
     * @param array $config
     */
    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * @param $key
     *
     * @return AbstractAdapter
     */
    public function getCache($key)
    {
        if (!isset($this->caches[$key])) {
            if (!isset($this->config[$key])) {
                throw new \LogicException(sprintf('No set %s cache', $key));
            }
            $config = $this->config[$key];
            switch ($config['adapter']) {
                case RedisAdapter::class:
                    $this->caches[$key] = new RedisAdapter(
                        RedisAdapter::createConnection($config['params']['dsn']),
                        isset($config['params']['namespace']) ? $config['params']['namespace'] : '',
                        isset($config['params']['lifetime']) ? $config['params']['lifetime'] : ''
                    );

                    break;
                default:
                    $this->caches[$key] = new $config['adapter'](
                        isset($config['params']['namespace']) ? $config['params']['namespace'] : '',
                        isset($config['params']['lifetime']) ? $config['params']['lifetime'] : '',
                        isset($config['params']['directory']) ? $config['params']['directory'] : app()->getPath().'/runtime/cache'
                    );
            }
        }

        return $this->caches[$key];
    }

    /**
     * {@inheritdoc}
     */
    public function initPool()
    {
        foreach ($this->config as $name => $config) {
            $this->getCache($name);
        }
    }
}

```

### 使用 Redis 配置

缓存此处使用 dsn 形式进行配置，因此写法需要按照规范进行填写，如: `redis://user:pass@host:port/db`

```php
<?php

return [
    'default' => [
        'adapter' => \Symfony\Component\Cache\Adapter\RedisAdapter::class,
        'params' => [
            'dsn' => 'redis://localhost:3306/db',
        ],
    ],
];
```

通过配置完以上配置，框架会自动切换到 redis 驱动中进行数据缓存。无论是文件缓存或者其他不一样驱动的缓存，写法上保持一致。


# Redis cache

Currently support file cache, redis cache, the realization of the code as follows:

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

### Configure using Redis

The cache here uses the dsn form of configuration, so the wording needs to be filled in according to the specification, such as: `redis: // user: pass @ host: port / db`

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

After configuring the above configuration, the framework will automatically switch to redis driver for data cache. Whether it is a file cache or other cache driven differently, the wording of the same.
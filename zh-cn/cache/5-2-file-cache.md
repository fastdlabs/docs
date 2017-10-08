# 文件缓存

Symfony cache 在对象初始化的时候会调用 `init` 方法，用于区分处理不同适配器之间的差异。

在文件缓存初始化过程中，会初始化缓存存放的路径。可以通过配置文件中的 `params` 选项进行配置。如:

```php
<?php

return [
    'default' => [
        'adapter' => \Symfony\Component\Cache\Adapter\FilesystemAdapter::class,
        'params' => [
            'directory' => '/tmp',
        ],
    ],
];
```

初始化代码:

```php
<?php

namespace Symfony\Component\Cache\Adapter;

use Symfony\Component\Cache\Exception\InvalidArgumentException;

trait FilesystemAdapterTrait
{
    private $directory;

    private function init($namespace, $directory)
    {
        if (!isset($directory[0])) {
            $directory = sys_get_temp_dir().'/symfony-cache';
        } else {
            $directory = realpath($directory) ?: $directory;
        }
        if (isset($namespace[0])) {
            if (preg_match('#[^-+_.A-Za-z0-9]#', $namespace, $match)) {
                throw new InvalidArgumentException(sprintf('Namespace contains "%s" but only characters in [-+_.A-Za-z0-9] are allowed.', $match[0]));
            }
            $directory .= DIRECTORY_SEPARATOR.$namespace;
        }
        if (!file_exists($directory)) {
            @mkdir($directory, 0777, true);
        }
        $directory .= DIRECTORY_SEPARATOR;
        // On Windows the whole path is limited to 258 chars
        if ('\\' === DIRECTORY_SEPARATOR && strlen($directory) > 234) {
            throw new InvalidArgumentException(sprintf('Cache directory too long (%s)', $directory));
        }

        $this->directory = $directory;
    }
    // ......
}
```

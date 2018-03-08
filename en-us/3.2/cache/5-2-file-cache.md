# File cache

Symfony cache invokes the init method when an object is initialized to differentiate between different adapters.

During file cache initialization, the path to the cache is initialized. It can be configured via the `params` option in the configuration file. Such as:

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

Initialization code:

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
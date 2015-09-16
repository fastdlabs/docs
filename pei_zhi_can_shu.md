#参数配置

###完整配置

```php
'media' => [
    'resources_url' => '',
    // 数据提供器
    'provider' => [
        'connection' => 'media',
        'repository' => 'Media:Repository:Media',
        'remote_url' => '/', // 数据提供地址
    ],
    // 远程上传
    'remote' => [
        'prefix'    => '',
        'url'       => '',
    ],
    // 缩略图
    'thumbnil' => [
        'width'     => 120,
        'height'    => 120,
    ],
    'uploaded' => [
        'path' => '%root.path%/../public/upload/%date%',
        'exts' => [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/icon'
        ],
        'size' => '10M',
        'url'  => '/', // 上传地址，已upload_url赋值到模板
    ],
],
```
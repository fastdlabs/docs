#Usage

完整的参数配置请看: [配置参数](pei_zhi_can_shu.md)

----

引入了 `media-bundle` 后，可以在通过路由名获取媒体资源管理列表。`media_bundle_list`，媒体资源管理列表数据来源于两个地方，分别是

```php
'media' => [
    // ...
    // 数据提供器
        'provider' => [
            'connection' => 'media',
            'repository' => 'Media:Repository:Media',
            'remote_url' => '/', // 数据提供地址
        ],
    // ...
]
```
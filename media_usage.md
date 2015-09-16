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

来源"本地"数据: `connection` 和 `repository`，链接和库，可以自行配置 `repository` 返回什么数据，`repository` 需要实现 `Media\Std\ProviderInterface` 接口，实现 `getMedia($page, $offset, $limited, $lastId)` 方法。

来源"远程"数据: `remote_url` 配置一个获取数据的远程地址，程序会自动向地址发起拉取请求。
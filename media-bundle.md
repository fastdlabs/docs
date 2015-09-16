#media-bundle

###Author @JanHuang
 
灵活，自由整合的媒体资源管理包。其中包括编辑器(summernote)的文件上传功能，附带在线管理，本地上传，远程插入功能。侧边栏则有媒体管理列表操作，而API则提供文件上传及远程上传配置等功能

----

#Usage

```json
{
    "require": {
        "fastd/media-bundle": "1.0.*@alpha"
    }
}
```

```php
class Application extends \FastD\Framework\Kernel\AppKernel
{
    /**
     * Register project bundles into the kernel.
     *
     * @return array
     */
    public function registerBundles()
    {
        return array(
            new \Asset\AssetBundle(),
            new \Admin\AdminBundle(),
            new \Media\MediaBundle(),
            new \Almanac\AlmanacBundle(),
        );
    }

    /**
     * Register custom kernel plugins.
     * Must return array.
     * examples:
     *  return array(
     *      "Monolog\\Logger"
     *  )
     *
     * @return array
     */
    public function registerService(){return [];}

    /**
     * @return array
     */
    public function registerConfigVariable(){return [];}

    /**
     * Register application configuration
     *
     * @param \FastD\Config\Config
     * @return void
     */
    public function registerConfiguration(\FastD\Config\Config $config){}
}
```

----

###License  MIT
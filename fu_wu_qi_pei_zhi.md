#服务器配置

##Apache

因为框架中已经集成了 `.htaccess` 文件，所以服务器开启 `rewrite_mod` 即可，默认访问的是生产环境的 `prod.php`，如果在开发环境或者测试环境可以自行修改 `.htaccess` 文件中的 `prod.php` 索引文件。

##Nginx

`nginx` 稍微比较复杂。框架中的 `http` 组件解析并不是太过完善，需要在 `nginx` 上配置 `PATH_INFO` 参数。

```
```
#服务器配置

##Apache

因为框架中已经集成了 `.htaccess` 文件，所以服务器开启 `rewrite_mod` 即可，默认访问的是生产环境的 `prod.php`，如果在开发环境或者测试环境可以自行修改 `.htaccess` 文件中的 `prod.php` 索引文件。

##Nginx

`nginx` 稍微比较复杂。框架中的 `http` 组件解析并不是太过完善，需要在 `nginx` 上配置 `PATH_INFO` 参数。

```
server {
    listen 80;
    server_name [server_name];
    root [document_root];
    index (dev|test|prod).php;
    location ~ \.php {
            fastcgi_split_path_info ^(.+.php)(/.*)$;
            fastcgi_param   PATH_INFO $fastcgi_path_info;
            fastcgi_pass 127.0.0.1:9000;
            include fastcgi.conf;
    }
}
```

以上的配置可以完整的支持框架的运行。



# 安装

## Composer 

# Tutorial

##Documentation

[Documentation](http://www.fast-d.cn/docs/index.html)

##Rewrite rules

###Nginx

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

###Apache

Open Apache `rewrite_mod`.


# FastD PHP Simple Framework V2.0

FastD 是一个开源，面向对象的开发框架。其模式类似 Symfony 框架，良好的编码贵发，灵活的开发模式，而且入门门槛不高，适合初中高不同阶段的开发者和乐于学习的 PHP 开发者。

## 环境要求

* PHP 7+

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

#License MIT

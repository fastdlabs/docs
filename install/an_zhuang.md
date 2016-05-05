# 安装

### 对运行环境的要求

FastD 对运行环境是有一定要求的。

* PHP 7+
* ext-curl
* ext-pdo

确保以上环境要求之后就可以安装 FastD 了。

### Composer 

FastD 利用 [Composer](http://getcomposer.org) 来管理其自身的依赖包。因此，在使用 FastD 之前，请务必确保在你的机器上已经安装了 `Composer `。

```

```

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


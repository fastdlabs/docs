# 安装

### ＃对运行环境的要求

FastD 对运行环境是有一定要求的，在安装框架前需要确认一下扩展正常运行: 

* PHP 7+
* ext-curl
* ext-pdo

### ＃Composer 

FastD 利用 [Composer](http://getcomposer.org) 来管理其自身的依赖包。因此，在使用 FastD 之前，请务必确保在你的机器上已经安装了 `Composer `。

```
git clone https://github.com/JanHuang/fastD.git
cd fastD
composer install -vvv 
```

### ＃环境配置

保证目录在当前进程的读写权限，特别是 `app/storage` 的读写权限，因为此目录是用于数据缓存读写的。

其次要配置好 `php.ini` 时区。

##### ＃Nginx

```
server
{
    listen       80;
    server_name  {server_name};
    index {(dev|test|prod)}.php;
    root {document_root};
    location / {
        try_files $uri @rewriteapp;
    }
    location @rewriteapp {
        rewrite ^(.*)$ /{(dev|test|prod)}.php$1 last;
    }
    location ~ \.php {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_split_path_info ^(.+.php)(/.*)$;
        include       fastcgi_params;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTPS              off;
    }
}
```

注意 `{}` 里面使用与配置你该有的域名及入口文件的，请对应修改自己服务器的配置。

##### ＃Apache

项目的 `public` 目录下已经存在了 `.htaccess` 文件了，所以 `apache` 只需要开启 `rewrite_mod` 模块即可 


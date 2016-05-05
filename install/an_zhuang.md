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
composer create-project fastd fastd/fastd
```

### 环境配置

保证目录在当前进程的读写权限，特别是 `app/storage` 的读写权限，因为此目录是用于数据缓存读写的。

其次要配置好 php.ini 时区。

#### Nginx

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

#### Apache

`rewrite_mod`


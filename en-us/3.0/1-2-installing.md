# Installing FastD 

> If you use a browser to access the portal, you need to configure the virtual domain name for the project, point the path to the project's web directory

##### 1 If you do not have Composer installed 

```
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```

##### 2 Install Swoole extension

```
$ pecl install 
```

##### 3 Installing fastd/dobee

```
$ composer create-project "fastd/dobee" dobee -vvv 
```

##### 4 Start server

Access PHP's built-in web server via browser or visit the current web directory

**Start the built-in web server**

```shell
$ cd dobee
$ php -S 127.0.0.1:9527 -t ./web 
```

**Start Swoole**

```php
$ php bin/server 
```

Browser access `127.0.0.1: 9527` to get the result

### Windows config

Because swoole does not consider too much windows environment, it is recommended to use the virtual machine environment for development, Windows only supports the traditional PHP mode.

##### 1 Installing fastd/dobee
 
```
$ composer create-project "fastd/dobee" dobee -vvv 
```

##### 2 Startd Server

**Start the built-in web server**

```shell
$ cd dobee
$ php -S 127.0.0.1:9527 -t ./web 
```

Accessing PHP's built-in web server through a browser or accessing the current web directory via apache / nginx

### Nginx config

搭配推荐使用 Nginx 作为代理入口，通过 Nginx 转发到后端服务器处理。

##### FPM

```
server
{
    listen     {server port};
    index index.php;
    server_name {server name};
    root /path/to/dobee/web;
    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }
    location ~ \.php {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include       fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

##### Swoole

```
server 
{
    listen     {server port};
    server_name {server name};
    location / {
        proxy_pass http://127.0.0.1:9527; # Swoole Server Listen
    }
}
```

下一节: [Directory Structure](zh-cn/3.0/1-3-directory-structure.md)

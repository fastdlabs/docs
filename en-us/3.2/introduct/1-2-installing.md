# Install FastD

!> If you use a browser to access the portal, you need to configure the virtual domain name for the project, point the path to the project's web directory

?> Recommended for use with Vagrant virtual machines to adapt faster to development environments.

### Linux environment

##### 1 If Composer is not installed

```
$ curl -sS https://getcomposer.org/installer | php
$ mv composer.phar /usr/local/bin/composer
$ chown +x /usr/local/bin/composer
```

: soon: domestic image to speed up composer installation

```
composer config -g repo.packagist composer https://packagist.laravel-china.org
```

##### 2 Install the Swoole extension

?>: bangbang: Recommended version 1.9.9 or later

```
$ pecl install swoole
```

##### 3 Install fastd / dobee

```
$ composer create-project "fastd/dobee" dobee -vvv 
$ cd dobee && composer install -vvv
```


##### 4 Start the built-in web server

> Recommended to use in a development environment, detachable from Apache and Nginx, easier to use

```shell
$ cd dobee
$ php -S 127.0.0.1:9527 -t ./web
$ curl http://127.0.0.1:9527/
```

##### Start the Swoole server

```php
$ php bin/server start
$ curl http://127.0.0.1:9527/
```

### Windows environment

Because swoole does not consider too much windows environment, it is recommended to use the virtual machine environment for development, Windows only supports the traditional PHP mode.

##### 1 Install fastd / dobee
 
```
$ composer create-project "fastd/dobee" dobee -vvv 
```

##### 2 PHP built-in web server

```shell
$ cd dobee
$ php -S 127.0.0.1:9527 -t ./web
$ curl http://127.0.0.1:9527/
```

##### 3 Configure apache virtual domain name

Modify httpd.conf, open vhost.conf, add the virtual name and vhost.conf file, modify the directory address.

```apacheconfig
<VirtualHost *:80>
    DocumentRoot "/path/to/web"
    ServerName example.com
</VirtualHost>
```

Map the local ip to the virtual domain name, modify the hosts file below System32

##### 4 Configure the nginx configuration

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

### Nginx + Swoole Agent (Linux recommended)

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

Not recommended to completely replace Nginx FPM, Nginx as a front-end server, after all, flexibility and scalability will be greatly enhanced.

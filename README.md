# 简介

###FastD PHP Simple Framework 

是一个开源，面向对象的开发框架，简称 FD。灵活自由并且优雅地开发web项目。并且较低的入门门槛，适合初中高不同阶段的开发者。

框架主要提倡灵活自由开放，并且自身遵循 `PSR` 开发规范，字需要开发者也遵循 `PSR` 开发规范即可。

------

###Jan Huang

Github: [JanHuang](https://github.com/JanHuang)

#FastD-PHP-Simple-Framework

##发起人
* JanHuang / bboyjanhuang@gmail.com

##维护者

* JanHuang / bboyjanhuang@gmail.com
- [Homepage](http://www.fast-d.cn)

##Requirement

* PHP 5.4+

##Install

###1. Install composer.json

[Composer](https://getcomposer.org/download/)


###2. Clone FastD repository

```
git clone git@github.com:JanHuang/fastD.git
```

###3. Composer install

```
composer -vvv install
```

#Tutorial

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

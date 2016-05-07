# 命令行

框架本身提供命令的方式对程序进行管理，具体参考了 Symfony 的设计与布局方式，因此在开发中也需要注意命令的使用，适当地使用命令可以大大提高开发的便利与健壮，但同时需要文档说明操作流程。

命令目录: `{bundle}/Commands`

###＃系统命令

命令可以通过基础控制台管理进行展示: 

```php
php bin/console 
```

程序展示所有内置的所有命令。

```php
asset:
 ➜ asset:install
bundle:
 ➜ bundle:generate
config:
 ➜ config:cache
db:
 ➜ db:revert
 ➜ db:update
production:
 ➜ production:init
route:
 ➜ route:cache
 ➜ route:dump
```


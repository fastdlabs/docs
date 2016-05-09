# 扩展包开发

框架已经封装并且打包了一份扩展开发的组件，可独立运行扩展包，依附到框架当中，灵感来源于 Symfony。

BundleX 是用于开发框架扩展包的一个小组件，其工作主要是自动化生成环境文件，让 bundle 运行于和框架一样的环境下。

### ＃初始化 bundle

我们建立的 bundle 如果需要添加到 `packagist` 的话，大家可以参考这一篇文章: [使用GitHub、Composer、Packagist管理公开的PHP包](http://rivsen.github.io/post/how-to-publish-package-to-packagist-using-github-and-composer-step-by-step/)

如果你的 bundle 仅是私人管理，非对外开放，那么自需要建立你的 git 项目地址即可。

##### ＃初始化 composer.json

```php
composer init
```

添加依赖: 

```json
{
    ...
    "require-dev": {
        "fastd/bundlex": "~2.0"
    }
    ...
}
```

添加 autoload:

```json
{
    ...
    "require-dev": {
        "fastd/bundlex": "~2.0"
    }
    "autoload": {
        "psr-4": {
            "": "src"
        }
    },
    "autoload-dev": {
        "files": [
            "app/application.php"
        ]
    },
    ...
}
```

添加 config:

```json
{
    ...
    "require-dev": {
        "fastd/bundlex": "~2.0"
    }
    "autoload": {
        "psr-4": {
            "": "src"
        }
    },
    "autoload-dev": {
        "files": [
            "app/application.php"
        ]
    },
    "config": {
        "bin-dir": "bin"
    }
    ...
}
```

**记得添加 "config": {"bin-dir": "bin"}，否则脚本将不会同步到 bin 目录**

初始化完成 `composer.json` 文件，开始安装 `composer install`。

### ＃构建 bundle 运行环境

`composer` 安装完成后，会新增一个 `bin` 目录，目录中有三个文件，执行: 

```php
php bin/bundlex
```

构件 `bundle` 运行环境，然后程序会自动生成所有构件文件，变成一个可运行的框架环境。

创建 `bundle`:

```php
php bin/console bundle:generate name
```

创建 `bundle`，然后添加到 `app/application.php` 中即可，其他操作和框架开发保持一致，代码提交只需要提交相关配置和 `src` 源代码即可。

### ＃安装扩展依赖

如果扩展包是提交到 `packagist` 的话，那么在 `composer.json` 中添加 `require`，然后将扩展包的引导文件添加到 `app/application.php` 即可。

如果扩展包是私有的，需要在 `composer.json` 添加 `repositories` 配置。

```json

```
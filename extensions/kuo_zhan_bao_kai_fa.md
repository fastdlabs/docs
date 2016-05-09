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

初始化完成 `composer.json` 文件，开始安装 `composer install`。

### ＃构建 bundle 运行环境

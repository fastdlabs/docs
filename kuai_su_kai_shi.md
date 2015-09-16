# 快速开始

##通过 composer 安装

`FastD` 框架通过 `composer` 来安装以及管理其他组件。如果没有安装 `composer`，那么请先从安装 `composer` 开始吧。

已经安装完 `composer` 的可以在中断输入安装命令:

`composer create-project fastd/fastd path/to/your/project`

安装完成后，项目会生成在 `path/to/your/project` 目录当中

访问地址:

`http://localhost/path/to/your/project/public/dev.php/`

即可出现官网首页。

##路由

路由配置在每个 `bundle` 的 `Resources/config/routes.php` 文件中，通过注册路由来为每个事件进行绑定。

路由写法:

```php
Routes::{method}(['/', 'name' => '路由名'], '绑定触发的事件对象');
```

路由初始化完成后，会返回一个 `\FastD\Routing\Route` 对象，对象函数多个链式方法，可用于设置请求目标的各个参数

##触发事件绑定

而路由的设置则需要对应一个相应的动作，或者说是触发的事件，因为服务器需要响应客户端，你可以这么理解。

而绑定时间实则是非常简单。只需要将完整的对象名和方法填写到路由的第二个参数即可。

```php
Routes::get(['/', 'name' => '路由名'], 'Namespace\ClassName@method');
```

以上用户在请求地址: `/` 的时候，就会触发 `Namespace\ClassName@method` 此对象的 `method` 方法。

##事件响应

每个路由对应的事件方法，需要返回一个字符串或者一个 `FastD\Http\Response` 对象，也就是说，需要 `return string|Object;`, 否则框架会抛出异常。

例如:

```php
return 'hello world';
or
return new \FastD\Http\Response('hello world');
```

首先说说这个设计的想法。咱们框架目前主流的都是第一入口，那么为什么有些框架出口不是单一的呢？比如 `ThinkPHP`, 那么如果出口没有单一，那么就会造成很多的返回不一致，输出格式不一致，并且有可能导致意料之外的bug。所以这里呢，就设置统一入口和出口，并且可以灵活的调用各个方法。



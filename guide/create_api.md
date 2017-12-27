# 创建API

创建API，仅需要两步:

1. 创建控制器: 主要用于路由回调，当路由被成功访问，会逐层处理直到调度到自定义控制器当中
2. 创建路由: 给控制器添加访问入口，如需要对外提供访问，必须要设置对应路由方法。

## 创建控制器与路由

假设你想创建一个 `/hello/{名字}` 生成对方名字并打印出来。为此，在其中创建一个 Controller 类和 Controller 方法即可:

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class HelloController
{
    /**
     * @param ServerRequest $request
     * @return \FastD\Http\Response
     */
    public function hello(ServerRequest $request)
    {
        return json([
            'msg' => 'hello '.$request->getAttribute('name')
        ]);
    }
}
```

现在，你需要将控制器和方法与路由进行关联，以便用户能够正常访问。这个关联通过 `config/routes.php` 文件进行配置。

```php
<?php

$router = route();

$router->get('/hello/{name}', 'HelloController@hello');
```

现在，你可以尝试对其进行访问:

> http://localhost:9876/hello/jan

## 创建中间件

fastd 框架的另外一个特点，就是一切逻辑处理，控制器都是一个中间件。为此，先附上一个图:

![](https://www.slimframework.com/docs/images/middleware.png)

整个应用就想一个洋葱，一层一层剥开，知道最内的"心(控制器)"，至此，完成整个调用。

理解上述原理之后，那么咱们开始做第一个中间件吧。

创建

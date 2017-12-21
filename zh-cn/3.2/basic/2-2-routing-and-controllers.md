# 路由与控制器

路由的提供来源于 [routing](https://github.com/JanHuang/routing) 组件，提供高性能的路由配置和解析处理，良好地支持 RESTful，支持模糊匹配。

### 路由配置

在路由回调处理中，控制器不需要编写命名空间，默认在控制器前追加 `Controller` 命名空间。

!> 从 3.1 版本开始，控制器已经迁移到 `Controller` 目录，3.0 版本存储在 `Http/Controller` 目录

#### 方法路由
 
```php
route()->get('/', 'IndexController@sayHello');
``` 

```php
route()->post('/', 'IndexController@sayHello');
```

支持 `get, post, put, head, delete` 方法。添加路由名，可以更加方便在 [TCPServer](zh-cn/3-9-swoole-server.md) 中调用

#### 路由组

```php
route()->group('/v1', function () {
    route()->get('/', 'IndexController@sayHello');
});
```

以上路由会在用户访问 `/v1/` 或者 `/v1` 时候进行回调处理。

#### 模糊匹配

```php
route()->get("/foo/*", "IndexController@sayHello");
```

此模式会将 /foo 开头的 `[\/_a-zA-Z0-9-]+` 匹配地址到控制器当中，通过 `fuzzy_path` 参数进行获取匹配到的地址。

```php
$request->getAttribute('fuzzy_path');
```



路由组支持全局设置中间件，可以子路由可以统一设置中间。子路由中会默认继承路由组中的中间级，如果在路由组中继续定义中间件，会继续追加到指定路由中。

### 控制器

路由配置不支持匿名函数回调，因此在核心处理中屏蔽了该功能，用户保持配置文件的清洁与独立，建议开发者使用控制器回调的方式进行处理。

!> 控制器目前存放于 Http 目录中，3.1 版本后将统一控制器入口，同时为TCP、HTTP提供服务, 去除 Http 目录，保留 Controller 目录，其他结构不变

> 控制器无需继承任何对象，方法均有 [辅助函数](zh-cn/3-7-helpers.md) 提供

#### 正常响应

对应路由的控制器方法都必须返回一个 `Response` 对象，否则无法向客户端发送数据。

框架内置 `json` 函数，用于封装输出 `json` 格式的数据，使用如下: 

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        return json([
            'name' => $request->getAttribute('name')
        ]);
    }
}
```

控制器(中间件)方法默认接收: `ServerRequest` 对象，`ServerRequest` 对象实现来自 http 组件，内封装对 http 协议常规处理。

#### 异常中断

框架中提供中断处理，用于应用发生异常时，提示客户端进行处理。

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        abort(400, 'foo bar');
    }
}
```

对应客户端接收到的格式如下:

```json
{
    "code": 400,
    "msg": "foo bar"
}
```

下一节: [请求](zh-cn/basic/2-3-request-handling.md)

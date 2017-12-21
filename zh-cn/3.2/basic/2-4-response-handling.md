# 响应处理

每个路由对应控制器方法，并且方法需要返回对应响应信息，完成一次完整的请求响应。

#### 响应体

利用框架提供的 `json` 函数，能够快速向客户端输出 `json` 格式的数据。

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        return json([
            'foo' => 'bar'
        ]);
    }
}
```

如果需要响应特殊的 http 状态码，可以通过第二个参数进行调整。

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        return json([
            'foo' => 'bar'
        ], 201);
    }
}
```

#### 响应头

当如果需要自定义一些响应头的时候，可以利用 PSR7 Response 对象方法来设置响应头.

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        return json([
            'args' => $request->getParsedBody()
        ])->withHeader('foo', 'bar');
    }
}
```

##### 设置 Cookie

利用响应头，设置 cookie 信息，框架 cookie 的实现也是利用 `header` 函数进行实现的。

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        return json([
            'args' => $request->getParsedBody()
        ])->withCookie('foo', 'bar');
    }
}
``` 

##### 设置 cache-control

Response 对象还提供了常用的 http 缓存配置。

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        return json([
            'args' => $request->getParsedBody()
        ])->withCacheControl('public')
        ->withExpires(new \DateTime('2017-10-11'));
    }
}
```

下一节: [中间件](zh-cn/basic/2-5-middleware.md)
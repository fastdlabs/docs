# 中间件

路由是整个框架最核心的功能之一，最后执行会根据路由地址操作最终的回调处理，而这个回调处理本身就是一个中间件处理模块之一。

当控制器配置中间件之后，执行会先将配置的中间件全部调用完，最终落地到控制器方法中，由开发者最终处理。

### 中间件配置

操作步骤仅需三步:

1. 新建中间件
2. 注册中间件到配置文件
3. 添加中间到路由器

```php
<?php

return [
    // some code...
    /**
     * Http middleware
     */
    'middleware' => [
        'foo' => Bar::class,
    ],
];
```

添加到路由中

```php
route()->post('/', 'IndexController@sayHello')->withMiddleware('basic.auth');
```

### 自定义中间件

实现自己的中间件，只需要实现小部分代码，就能够完成一个简单的中间件处理。

```php
<?php

namespace FastD\Auth;

use FastD\Middleware\DelegateInterface;
use FastD\Middleware\Middleware;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use FastD\Http\Response;

class BasicAuth extends Middleware
{
    /**
     * @param ServerRequestInterface $serverRequest
     * @param DelegateInterface $delegate
     * @return ResponseInterface
     */
    public function handle(ServerRequestInterface $serverRequest, DelegateInterface $delegate)
    {
        if (/* logic */ true) {
            $delegate->process($serverRequest);
        }
        
        return new Response('hello');
    }
}
```

中间件调度中，推荐返回 `Psr\Http\Message\ResponseInterface`，每个中间件都需要遵循的规定。

实现原理可以参考: [PSR15](https://github.com/php-fig/fig-standards/blob/master/proposed/http-middleware)

下一节: [授权](zh-cn/3.2/basic/2-6-authorization.md)

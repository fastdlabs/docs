# 中间件

路由是整个框架最核心的功能之一，最后执行会根据路由地址操作最终的回调处理，而这个回调处理本身就是一个中间件处理模块之一。

当控制器配置中间件之后，执行会先将配置的中间件全部调用完，最终落地到控制器方法中，由开发者最终处理。

### 授权中间件

框架内置授权中间件，依赖于 [fastd/basic-authenticate](https://github.com/JanHuang/basic-authenticate)。

```php
<?php

return [
    // some code...
    /**
     * Http middleware
     */
    'middleware' => [
        'basic.auth' => new FastD\BasicAuthenticate\HttpBasicAuthentication([
            'authenticator' => [
                'class' => \FastD\BasicAuthenticate\PhpAuthenticator::class,
                'params' => [
                    'foo' => 'bar'
                ]
            ],
            'response' => [
                'class' => \FastD\Http\JsonResponse::class,
                'data' => [
                    'msg' => 'not allow access',
                    'code' => 401
                ]
            ]
        ])
    ],
];
```

可以修改 `params` 选项来调整授权的用户和密码。

`response` 选项用于授权失败的响应数据和格式。

添加到路由中

```php
route()->post('/', 'IndexController@sayHello')->withMiddleware('basic.auth');
```

### 缓存中间件

框架并且内置了缓存中间件，可用于普通响应缓存中，能都大大缩减程序执行时间，提高处理效率。

```php
<?php

return [
    // some code
    'middleware' => [
        'common.cache' => [
            \FastD\Middleware\CacheMiddleware::class,
        ],
    ],
    // some code
];
```

配置到具体路由中。当发起GET请求的时候，系统都回去检查缓存是否存在，其他非GET则穿透到具体处理中。

```php
route()->post('/', 'IndexController@sayHello')->withMiddleware('common.cache');
```

响应头中会多出 `x-cache` 字段。

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
            $delegate($serverRequest);
        }
        
        return new Response('hello');
    }
}
```

中间件调度中，推荐返回 `Psr\Http\Message\ResponseInterface`，每个中间件都需要遵循的规定。

实现原理可以参考: [PSR15](https://github.com/php-fig/fig-standards/blob/master/proposed/http-middleware)

下一节: [授权](zh-cn/basic/2-6-authorization.md)

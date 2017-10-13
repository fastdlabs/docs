# 中间件

### 中间件

路由是整个框架最核心的功能之一，最后执行会根据路由地址操作最终的回调处理，而这个回调处理本身就是一个中间件处理模块之一。

使用中间件前，需要先配置可用中间件列表，通过 `config/app.php` 配置文件进行配置

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

键名 `basic.auth` 即是中间件名字，可以通过 

```php
route()->post('/', 'IndexController@sayHello')->withMiddleware('basic.auth');
```

进行配置。每当程序调用 `/` 地址的时候，会先经过配置的中间件。

##### 路由组中间件

```php
route()->group(['prefix' => '/v1', 'middleware' => 'demo'], function () {
    route()->get('/', 'IndexController@sayHello');
});
```

中间件的原理其实是一个多层嵌套的匿名函数，由一开始调用的函数开始，一直往下调用，直到后面已经没有回调的时候，返回给客户端。

这里面的中间件也是这样的原理，当中间件处理完成后，最后才到路由中的回调，中间件依赖于 [middleware](https://github.com/JanHuang/middleware) 组件，支持 PSR15。

中间件推荐存放在 `src/Middleware` 目录中，每个中间件必须继承 `FastD\Middleware\Middleware` 对象，实现 `handle` 方法。

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

中间件中，如果返回的结果是一个字符串，则会默认转化成 `Psr\Http\Message\ResponseInterface` 对象，由中间件调度器进行封装。

因此如果想在中间件中返回不同的格式，那必须返回一个 `Psr\Http\Message\ResponseInterface` 对象，可自定义。

实现原理可以参考: [PSR15](https://github.com/php-fig/fig-standards/blob/master/proposed/http-middleware)

下一节: [命令行](zh-cn/3-3-database.md)

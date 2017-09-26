FastD 是一个专门针对 API 应用层而生的一个 PHP 应用框架，提供良好的中间件，路由以及支持 swoole 扩展运行，从而具体良好的性能条件。

#### 创建项目

```
composer create-project fastd/dobee api -vvv
```

创建一个为 API 的项目。

#### 运行第一个程序

进入命令行模式

```
php -S localhost:9876 -t web
```

访问 `localhost:9876`

```json
{
    "msg":"hello dobee"
}
```

#### 执行流程

点击: [FastD设计详解](http://fastdlabs.com/blog/2)

#### 实现第一个路由

##### 1. 创建"控制器"

通过命令行

```
php bin/console controller:create {name}
```

命令行会自动创建 CURD 多个操作方法，由开发者手动添加操作逻辑。

手动创建

MeController.php

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class MeController
{
    public function me(ServerRequest $request)
    {
        return json([
            'name' => 'janhuang'
        ]);
    }
}
```

##### 2. 添加路由地址

```php
<?php

route()->get('/', 'WelcomeController@welcome');
route()->get('/hello/{name}', 'WelcomeController@sayHello');
route()->get('/who', 'MeController@me');
```

##### 3. 调用

```
curl -i http://127.0.0.1:9876/who
```

> response

```json
{
    "name": "janhuang"
}
```

完成最第一个路由。

#### 给应用添加单元测试

我仍热认为测试是一个非常重要的环节，也是一个优秀开发者一个重要品质之一。

如果其中涉及数据库测试，可以参考: [数据库测试](https://github.com/JanHuang/fastD/blob/master/docs/zh_CN/3-6-testcase.md#数据库测试)

```php
<?php

namespace Testing;


use FastD\TestCase;

class WelcomeControllerTest extends TestCase
{
    public function testSayHello()
    {
        $request = $this->request('GET', '/');
        $response = $this->app->handleRequest($request);
        $this->isSuccessful($response);
    }
}
```

可以给你的应用API添加格式各样的测试，来验证程序的有效性。

#### 给 API 添加公共缓存

**何为公共缓存？**

公共缓存的灵感来自于 [varnish](https://varnish-cache.org/)，当用户发起非 `GET` 请求的时候，进行缓存处理并返回(如果有的话)，其他请求一律穿透，交给底层处理。

缓存也是一个前置中间件，使用方式与日常操作保持一致。

文档: [中间件](https://github.com/JanHuang/fastD/blob/master/docs/zh_CN/3-2-middleware.md)

`config/app.php`

```php
<?php

return [
    // code...
    /**
     * Http middleware
     */
    'middleware' => [
        // code
        'common.cache' => [\FastD\Middleware\CacheMiddleware::class]
    ],
];
```

`config/routes.php`

```php
<?php

route()->get('/', 'WelcomeController@welcome');
route()->get('/hello/{name}', 'WelcomeController@sayHello');
route()->get('/who', 'MeController@me')->withMiddleware('common.cache');
```

完成配置后，请求路由地址

```
curl -i http://localhost:9876/who

HTTP/1.1 200
Host: localhost:9876
Connection: close
X-Powered-By: PHP/7.0.0
Content-Type: application/json; charset=UTF-8
X-Cache: ee4d94f352cb03116b61ce9158720ebf
Expires: Tue, 08 Aug 2017 10:58:21 GMT
```

会产生 `X-Cache` 新的响应头，用于代表缓存生效。

#### Basic Auth

大部分 API 中，都需要对请求来源进行一定的鉴权处理，由于框架已经集成了简单的 Basic auth，使用方法与上述保持一致。

```php
<?php

route()->get('/', 'WelcomeController@welcome');
route()->get('/hello/{name}', 'WelcomeController@sayHello');
route()->get('/who', 'MeController@me')->withMiddleware(['basic.auth', 'common.cache']);
```

#### 为 API Server 加速

众所周知，[swoole](http://swoole.com/) 为 PHP 提供了良好的性能体验和网络通信体验，而框架中也无缝整合 swoole，为框架、服务提供良好体验做了一个铺垫，现在，你只需要配置IP、端口、swoole常用配置，即可无痕启动以 swoole 服务器，为你的 API Server 进行加速处理。

`config/server.php`

```php
<?php
/**
 * @author    jan huang <bboyjanhuang@gmail.com>
 * @copyright 2016
 *
 * @link      https://www.github.com/janhuang
 * @link      http://www.fast-d.cn/
 */

return [
    'host' => 'http://'.get_local_ip().':9527',
    'class' => \FastD\Servitization\Server\HTTPServer::class,
    'options' => [
        'user' => 'nobody',
        'group' => 'nogroup',
        'pid_file' => __DIR__ . '/../runtime/pid/' . app()->getName() . '.pid',
        'log_file' => __DIR__ . '/../runtime/logs/' . app()->getName() . '.pid',
        'log_level' => 5,
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [

    ],
    'listeners' => [

    ],
];
```

`get_local_ip` 函数为了默认或者本地内网ip，如果你的API是对外开放的，请修改为您的外网ip或者 `0.0.0.0`。

`options` 参数为 swoole 扩展配置参数。请参考: [swoole配置](https://wiki.swoole.com/wiki/page/274.html)

##### 启动

```
php bin/server start
```

##### 守护进程

```
php bin/server start -d
```

##### 停止

```php
php bin/server stop
```

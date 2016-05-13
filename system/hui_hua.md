# 会话

框架中的会话和本身 PHP 会话是基本一致，在原有基础上进行了简单的封装。

下述简单地谁明一下方法名和参数。具体操作应该由 `\FastD\Http\Request` 对象操作，而对象，应该在控制器方法中进行注入，示例: 

```php
/**
 * @Route("/session", name="base.session")
 *
 * @param Request $request
 * @return Response
 */
public function sessionAction(Request $request)
{
    if (!$request->hasSession('name')) {
        $request->setSession('name', 'jan');
    }

    $name = $request->getSession('name');

    if (!$request->hasCookie('age')) {
        $request->setCookie('age', 18);
    }

    $age = $request->getCookie('age');

    return $this->render('base/request.twig', [
        'name' => $name,
        'age' => $age,
    ]);
}
```

### ＃cookie

cookie 操作与 PHP 本身操作保持一致，只是框架中的 cookie 是一个对象，而 PHP 本身的是一个函数操作而已，内部实现也是通过 `setcookie` 进行处理。因此在效果，及操作上是没有太大区别。

**setCookie**

```php
\FastD\Http\Request::setCookie($name, $value = null, $expire = 0, $path = '/', $domain = null, $secure = false, $httpOnly = true);
```

**getCookie**

```php
\FastD\Http\Request::getCookie($name);
```

### ＃session

session 操作和原生 PHP 操作也是非常类似的，所以在操作上是很容易熟悉，过往 session 的设置大致应该是 `$_SESSION['name'] = name`，这让程序在本身的设计上会造成臃肿和难以维护，所以 session 是有必要分装成一个一致性，统一管理的对象，框架就是做了这么一个简单的封装。

**setSession**

```php
\FastD\Http\Request::setSession($name, $value);
```

**getSession**

```php
\FastD\Http\Request::getSession($name);
```

具体代码可看演示示例.

##### ＃session 自定义存储

框架的 session 本身提供两种存储模式，一是 PHP 默认的存储模式，另外一种则是可以注入 `Redis`, `Memcached` 进行存储的优化，而这里只需要简单地注入存储对象即可。

目前系统提供支持 `Redis` 的自定义存储 `FastD\Http\Session\Storage\SessionRedis` 对象，其他存储方式需要手动进行扩展。

**注意: sessionHandler需要在一开始初始化的时候进行注入，否则不生效，因为 session 在每一个请求中只能初始化一次** 

##### ＃自定义存储配置

```php
<?php return [
    // ...
    'storage' => [
        'session' => [
            'type' => 'redis',
            'host' => '11.11.11.11',
            'port' => 6379
        ]
    ]
    // ...
];
```
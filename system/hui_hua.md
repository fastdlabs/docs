# 会话

##### ＃cookie

cookie 操作与 PHP 本身操作保持一致，只是框架中的 cookie 是一个对象，而 PHP 本身的是一个函数操作而已，内部实现也是通过 `setcookie` 进行处理。因此在效果，及操作上是没有太大区别。

**setCookie**

```php
$request->setCookie($name, $value = null, $expire = 0, $path = '/', $domain = null, $secure = false, $httpOnly = true);
```

**getCookie**

```php
$request->getCookie($name);
```

##### ＃session

session 操作和原生 PHP 操作也是非常类似的，所以在操作上是很容易熟悉，过往 session 的设置大致应该是 `$_SESSION['name'] = name`，这让程序在本身的设计上会造成臃肿和难以维护，所以 session 是有必要分装成一个一致性，统一管理的对象，框架就是做了这么一个简单的封装。

**setSession**

```php
$request->setSession($name, $value);
```

**getSession**

```php
$request->getSession($name);
```

具体代码可看演示示例.

##### ＃session 自定义存储

框架的 session 本身提供两种存储模式，一是 PHP 默认的存储模式，另外一种则是可以注入 `Redis`, `Memcache` 进行存储的优化，而这里只需要简单地注入存储对象即可。

注意: **sessionHandler需要在一开始初始化的时候进行注入，否则不生效，因为 session 在每一个请求中只能初始化一次** 

```php

```
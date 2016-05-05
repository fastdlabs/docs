# 路由

路由是一个框架必备的东西，配置的方式参考了 Laravel 和 Symfony 两个框架。

路由配置文件在 `{bundle}/Resources/config/routes.php`

## 基础路由配置

----

### GET

该路由地址只能通过 Get 访问

```
Routes::get('base', '/base', \WelcomeBundle\Controllers\Index::class.'@indexAction');
```

**Action**

```php
public function indexAction()
{
    return $this->response('hello world');
}
```

访问该地址会出现 `hello world` 字样，证明已经配置成功了。路由这里的第一个参数，是路由的名字，在其他地方进行调用的时候可以通过该名字直接进行调用

而 `indexAction` 即是控制器方法，具体请求处理的方法主体。

### POST

```
Routes::post('base_post', '/base', \WelcomeBundle\Controllers\Index::class.'@postAction');
```

**Action**

```php
public function postAction()
{
    return $this->response('That is POST request method.');
}
```

路由配置支持:

* get
* post
* put
* delete
* patch
* any (意指允许所有请求方法到达路由)

## 动态路由

```
Routes::get('dynamic', '/{name}', \WelcomeBundle\Controllers\Index::class.'@dynamicAction');
```

**Action**

```php
 public function dynamicAction($name)
{
    return $this->response('This variable is ' . $name);
}
```

访问地址: `/janhuang` 即可出现 `This variable is janhuang` 等字样，动态路由配置成功。

而动态路由中的参数 `{name}` 会作为控制器方法动态传递到方法中 `dynamicAction($name)` 。




###路由异常

在请求非法的情况下，会返回 Http status code: `403`，也就是说，如果一个 POST 请求路使用 GET 请求，则会抛出 `403` 状态的异常

如果请求一个不存在路由，则会抛出 `404` 异常。而解决这些异常的最好办法就是使用合法的路由地址。




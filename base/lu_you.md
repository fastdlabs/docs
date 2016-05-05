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

## 路由对象及其配置

当在配置路由地址的时候，方法均会返回一个路由对象，而路由对象自身实现自 `FastD/Routing/RouteInterface` 接口，而接口有数个方法，可以供给路由其他参数配置使用。以下是方法列表

```
<?php
/**
 * Created by PhpStorm.
 * User: janhuang
 * Date: 15/1/29
 * Time: 上午11:46
 * Github: https://www.github.com/janhuang 
 * Coding: https://www.coding.net/janhuang
 * SegmentFault: http://segmentfault.com/u/janhuang
 * Blog: http://segmentfault.com/blog/janhuang
 */

namespace FastD\Routing;

/**
 * Interface RouteInterface
 *
 * @package FastD\Routing
 */
interface RouteInterface
{
    /**
     * @return string
     */
    public function getHttpProtocol();

    /**
     * @param $httpProtocol
     * @return $this
     */
    public function setHttpProtocol($httpProtocol);

    /**
     * @param array $domain
     * @return $this
     */
    public function setDomain($domain);

    /**
     * @return array
     */
    public function getDomain();

    /**
     * @param array $ips
     * @return $this
     */
    public function setIps(array $ips);

    /**
     * @return array
     */
    public function getIps();

    /**
     * @param $name
     * @return $this
     */
    public function setName($name);

    /**
     * @return string
     */
    public function getName();

    /**
     * @param array $arguments
     * @return $this
     */
    public function setArguments(array $arguments);

    /**
     * @return array
     */
    public function getArguments();

    /**
     * @param array $defaults
     * @return $this
     */
    public function setDefaults(array $defaults);

    /**
     * @return array
     */
    public function getDefaults();

    /**
     * @param $route
     * @return $this
     */
    public function setPath($route);

    /**
     * @return string
     */
    public function getPath();

    /**
     * @return string
     */
    public function getPathRegex();

    /**
     * @param array $format
     * @return $this
     */
    public function setFormats(array $format);

    /**
     * @return string
     */
    public function getFormats();

    /**
     * @param array $requirements
     * @return $this
     */
    public function setRequirements(array $requirements);

    /**
     * @return string|array
     */
    public function getRequirements();

    /**
     * @param array $method
     * @return $this
     */
    public function setMethods(array $method);

    /**
     * @return string|array
     */
    public function getMethods();

    /**
     * @param $callback
     * @return $this
     */
    public function setCallback($callback);

    /**
     * @return \Closure
     */
    public function getCallback();

    /**
     * @param array $parameters
     * @return $this
     */
    public function setParameters(array $parameters);

    /**
     * @return string|array
     */
    public function getParameters();

    /**
     * @param $group
     * @return $this
     */
    public function setGroup($group);

    /**
     * @return string
     */
    public function getGroup();
}
```

###路由异常

在请求非法的情况下，会返回 Http status code: `403`，也就是说，如果一个 POST 请求路使用 GET 请求，则会抛出 `403` 状态的异常

如果请求一个不存在路由，则会抛出 `404` 异常。而解决这些异常的最好办法就是使用合法的路由地址。




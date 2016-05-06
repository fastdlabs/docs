# 控制器

控制器主要管理每个路由请求过来的具体逻辑业务，当然我不希望你把业务代码都放到路由中进行处理，当然我也没有开发这个功能。

控制器存放于目录: `{bundle}/Controllers`。

### 基础控制器

框架中本身都是需要命名空间的，所以在框架中控制器和路由的关系密不可分，每个路由都需要对应一个控制器。

```php
Routes::get('base', '/base', \WelcomeBundle\Controllers\Index::class.'@indexAction');
```

##### ＃响应 (response)

```php
public function indexAction()
{
    return $this->response('hello world');
}
```

控制器可以根据不同数据请求类型响应不同数据格式, 而数据请求类型是根据请求路由的扩展名进行控制，如: `/name.json` 则会自动响应 `json` 格式主体，前提必须你的内容格式符合 `json` 的响应格式，也就是: 数组(array)，否则会抛出异常。而每个返回(return) 必须是一个 `FastD\Http\Response` 对象，调度器中只接受 `FastD\Http\Response` 对象，这样可以控制统一个入口和统一的出口。

响应制定内容格式: 

```php
/**
 * @Route("/json")
 */
public function jsonAction()
{
    return $this->responseJson(['name' => 'janhuang']);
}
```

当访问执行此处代码的时候，就会响应对应的 `json` 内容到客户端。

### 依赖注入

控制器还支持一个强大的依赖注入，注入实现方式是根据容器注入进行实现，具体容器注入可看： [Container](https://github.com/JanHuang/container)

和 Symfony 一样，依赖注入也是通过参数进行注入，只是在实现上精简了很多。

```php
/**
 * @Route("/di")
 */
public function diAction(\FastD\Http\Request $request)
{
    return $this->response($request->getMethod());
}
```

也可以注入自定义的对象，前提对象现需要定义好。

### 跳转

跳转是一个只需要一行代码的工作。哈哈

```php
/**
 * @Route("/redirect")
 */
public function redirectAction(Request $request)
{
    return $this->redirect($this->generateUrl('/di'));
}
```

以上会直接跳转到上述定义的依赖注入控制器中。

### 创建路由

每个定义的路由都允许根据路由名来生成对应的路由地址。在上述跳转代码中，已经生成了一个路由地址。

```php
/**
 * @Route("/redirect")
 */
public function redirectAction(Request $request)
{
    return $this->response($this->generateUrl('/di'));
}
```

通过 `Controllers::generateUrl($name, array $parameters = [], $format = null)` 进行对路由的配置和管理。
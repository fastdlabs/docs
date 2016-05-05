# 控制器

控制器主要管理每个路由请求过来的具体逻辑业务，当然我不希望你把业务代码都放到路由中进行处理，当然我也没有开发这个功能。

控制器存放于目录: `{bundle}/Controllers`。

## 基础控制器

框架中本身都是需要命名空间的，所以在框架中控制器和路由的关系密不可分，每个路由都需要对应一个控制器。

```php
Routes::get('base', '/base', \WelcomeBundle\Controllers\Index::class.'@indexAction');
```

#### 响应 (response)

```php
public function indexAction()
{
    return $this->response('hello world');
}
```

## 依赖注入


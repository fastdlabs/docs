# 辅助服务

辅助服务是框架一系列的中间件，均有用户自定义设置，类似其他框架中的 `Helpers`，主要是辅助在操作中的函数封装，进行快速调用。

Services 目录: `{bundle}/Services`

### 辅助服务 (Services)

服务的定义和普通类定义保持一致，不要求继承，按照 PHP 本身的类定义即可。

```php
<?php

namespace WelcomeBundle\Services;

class Name
{
    public function getName()
    {
        return 'janhuang';
    }
}
```

将 services 注册到容器中 (`app/application.php`): 

```php
/**
 * @param Container $container
 */
public function registerService(Container $container)
{
    $container->set('name', WelcomeBundle\Services\Name::class);
}
```

第一个是服务的名字，必填，第二个是服务的类名地址或者实例对象。

在控制器中获取服务对象。

```php
<?php

namespace WelcomeBundle\Controllers;

use FastD\Framework\Bundle\Controllers\Controller;
use FastD\Http\Request;

/**
 * Class System
 *
 * @Route("/system")
 *
 * @package WelcomeBundle\Controllers
 */
class System extends Controller
{
    /**
     * @Route("/services", name="system.services")
     *
     * @param Request $request
     * @return \FastD\Http\Response
     */
    public function servicesAction(Request $request)
    {
        $name = $this->get('name');

        return $this->response($name->getName());
    }
}
```

使用 `Controller::get($name, array $parameters = [])`

获取服务对象其实就是获取容器中的对象，因此可以解释为什么将服务注册到容器当中，因为获取服务对象，需要经过容器获取，这么一来就可以解析，容器就是管理所有对象的地方。

### 服务依赖注入 
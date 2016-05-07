# 辅助服务

辅助服务是框架一系列的中间件，均有用户自定义设置，类似其他框架中的 `Helpers`，主要是辅助在操作中的函数封装，进行快速调用。

Services 目录: `{bundle}/Services`

### ＃辅助服务 (Services)

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

使用 

```php
Controller::get($name, array $parameters = [], $flag = false)
```

进行获取，如果带有动态参数，需要在获取的时候传递，`$flag` 代表是否重新实例化对象，默认为单例管理。

获取服务对象其实就是获取容器中的对象，因此可以解释为什么将服务注册到容器当中，因为获取服务对象，需要经过容器获取，这么一来就可以解析，容器就是管理所有对象的地方。

### ＃服务依赖注入

因为服务也以来容器，所以支持依赖注入也是很容易的，因为本身容器就是个注入容器。但是注入目前仅支持构造注入，方法注入需要动态传递参数。

```php
<?php

namespace WelcomeBundle\Services;

use FastD\Http\Request;

class Agent
{
protected $request;

public function __construct(Request $request)
{
$this->request = $request;
}

public function getAgent()
{
return $this->request->getUserAgent();
}
}
```

控制器调用:

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
$name = $this->get('name')->getName();

$agent = $this->get('agent')->getAgent();

return $this->render('system/services.twig', [
'name' => $name,
'agent' => $agent,
]);
}
}
```

结果和在方法中注入的 `FastD\Http\Request` 是一致的，并且他们的对象是同一个。对象在注入的时候会检查容器中是否存在该对象，如果存在，直接获取，不存在，实例化并保存容器中，避免再度实例化而损耗资源。
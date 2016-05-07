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



### 服务依赖注入 
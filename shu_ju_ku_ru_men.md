#数据库入门

##获取数据库连接

数据库配置参考[数据库配置](shu_ju_ku_pei_zhi.md)。

上述配置了 `read` 和 `write` 两个链接的配置。

获取 `read` 链接: 

```php

use FastD\Http\Request;

class Demo extends BaseEvent
{
    public function demoAction(){
        $connection = $this->getConnection('read');
        return 'connection ok';
    }
}

Routes::get('/', 'Demo@demoAction');
```

上述就可以正确的将 `read` 配置的数据库链接起来了。那如果出了 `read` 库操作之外，还需要操作 `write` 的话，也只需要写多一行代码，如: 

```php

use FastD\Http\Request;

class Demo extends BaseEvent
{
    public function demoAction(){
        $connection = $this->getConnection('read');
        $writeConnection = $this->getConnection('write');
        return 'connection ok';
    }
}

Routes::get('/', 'Demo@demoAction');
```

可以有效地链接两个数据库，并且进行一些读写分离，不同库操作的时候会方便很多哦亲。

##Repository

Repository的设计灵感来源于 `Symfony2` 框架中集成的 `Doctrine` 组件，在此处可以理解为 `Model`，因为当前的设计和功能优待提升。

###获取Repository






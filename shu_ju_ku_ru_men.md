#数据库入门

##获取数据库连接

数据库配置参考: [数据库配置](shu_ju_ku_pei_zhi.md)。

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

Repository 需要依赖数据连接，每个Repository对应多个链接。

每个 `getConnection` 方法都返回一个 `Connection` 对象，对象中可以通过 `getRepository` 来获取对应的 `Repository`。 如: 

```php
use FastD\Http\Request;

class Demo extends BaseEvent
{
    public function demoAction(){
        $connection = $this->getConnection('read')->getRepository('Demo');
        return 'get repository ok';
    }
}

Routes::get('/', 'Demo@demoAction');
```

首先 `Repository` 需要先定义好，不像使用 `ThinkPHP` 中的 `M` 方法。

以上的 `getRepository` 中的 'Demo' 参数值等同于 `\Demo` 类名，而 `getRepository` 中的参数正是 `Repository` 的完整类名，完整类名包括命名空间，而最后的名字 **不需要** 带 `Repository` 关键字，而类名的命名空间的写法则是用 "*:*" 冒号个开。如: 

`Repository` 对应一个表，表名可以使用保护属性 `table` 进行指定，默认是以 `Repository` 类名进行指定。如:

```
DemoRepository => table name demo
TestDemoRepository => table name test_demo
```

表名全小写，用下划线 `_` 隔开。

####获取指定的Repository

定一个 `Demo\\DemoRepository` 仓库对象:

```php
use FastD\Http\Request;

class Demo extends BaseEvent
{
    public function demoAction(){
        $connection = $this->getConnection('read')->getRepository('Demo:Demo');
        return 'get repository ok';
    }
}

Routes::get('/', 'Demo@demoAction');
```


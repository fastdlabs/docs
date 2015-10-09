#基础操作

以上一节的数据为例: [数据库入门](shu_ju_ku_ru_men.md)

创建新表: 

```
CREATE TABLE `demo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
```

创建 `Welcome\Demo\DemoRepository` 仓库: 

```
<?php

namespace Welcome\Repository;

use FastD\Database\Repository\Repository;

class DemoRepository extends Repository
{
    
}
```

##Create

```php
use FastD\Http\Request;

class Demo extends BaseEvent
{
    public function demoAction(){
        $demoRepository = $this->getConnection('read')->getRepository('Welcome:Repository:Demo');
        $demoRepository->insert([
            'name' => 'janhuang'
        ]);
        return 'connection ok';
    }
}

Routes::get('/', 'Demo@demoAction');
```

##Delete

删除操作因为比较危险，所以并没有直接提供删除操作，一般生产环境没有删除权限，也因此建议广大开发者尽量少用删除。但是如果想要删除的话，还是可以嗒: 

使用自定义语句进行删除操作: 

```php
use FastD\Http\Request;

class Demo extends BaseEvent
{
    public function demoAction(){
        $demoRepository = $this->getConnection('read')->getRepository('Welcome:Repository:Demo');
        $demoRepository->createQuery('delete from demo;')->getQuery()->getAffectedRow();
        return 'connection ok';
    }
}

Routes::get('/', 'Demo@demoAction');
```

详细在最后一小节: 自定义查询

##Update

##Read

##自定义语句
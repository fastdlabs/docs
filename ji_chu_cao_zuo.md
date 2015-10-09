#基础操作

以上一节的数据为例: [数据库入门](shu_ju_ku_ru_men.md)

创建新表: 

```
CREATE TABLE `demo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '',
  `extra` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
```

创建 `Welcome\Demo\DemoRepository` 仓库: 

```
<?php
/**
 * Created by PhpStorm.
 * User: janhuang
 * Date: 15/8/2
 * Time: 下午5:23
 * Github: https://www.github.com/janhuang
 * Coding: https://www.coding.net/janhuang
 * SegmentFault: http://segmentfault.com/u/janhuang
 * Blog: http://segmentfault.com/blog/janhuang
 * Gmail: bboyjanhuang@gmail.com
 * WebSite: http://www.janhuang.me
 */

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
        $connection = $this->getConnection('read');
        return 'connection ok';
    }
}

Routes::get('/', 'Demo@demoAction');
```

##Delete

##Update

##Read

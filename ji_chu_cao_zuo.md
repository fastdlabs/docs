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
        $connection = $this->getConnection('read')->getRepository('Welcome:Repository:Demo');
        return 'connection ok';
    }
}

Routes::get('/', 'Demo@demoAction');
```

##Delete

##Update

##Read

# 入门

```php
'database' => [
    'write' => [
        'database_type'     => 'mysql',
        'database_host'     => '127.0.0.1',
        'database_port'     => 3306,
        'database_user'     => 'root',
        'database_pwd'      => '123456',
        'database_charset'  => 'utf8',
        'database_name'     => 'test',
        'database_prefix'   => ''
    ],
    'read' => [
        'database_type'     => 'mysql',
        'database_host'     => '127.0.0.1',
        'database_port'     => 3306,
        'database_user'     => 'root',
        'database_pwd'      => '123456',
        'database_charset'  => 'utf8',
        'database_name'     => 'test',
        'database_prefix'   => ''
    ],
],
```

次数数据库无论有一个，还是多个，均使用二维数组进行定义。

在控制器中，通过 `FastD\Framework\Bundle\Controllers\Controller::getDriver($name)` 进行获取.

```php
<?php

namespace WelcomeBundle\Controllers;

use FastD\Framework\Bundle\Controllers\Controller;
use FastD\Http\Request;
use FastD\Http\Response;

/**
 * Class Database
 *
 * @Route("/database")
 *
 * @package WelcomeBundle\Controllers
 */
class Database extends Controller
{
    /**
     * @Route("/driver", name="database.driver")
     *
     * @param Request $request
     * @return Response
     */
    public function databaseAction(Request $request)
    {
        $write = $this->getDriver('write');

        return $this->render('database/drivers.twig' . [
                'write' => $write
            ]);
    }
}
```

获取后数据库连接后，即可以通过数据库连接驱动进行数据库操作。

##### ＃query($sql) 

```php
public function databaseAction(Request $request)
{
    $write = $this->getDriver('write');

    $result = $write->query('show tables')->execute()->getAll();

    return $this->render('database/drivers.twig' . [
            'result' => $result
        ]);
}
```

`query($sql)` 方法是执行一个数据库语句操作，包括 `insert`，`select`，`update`，`delete`，
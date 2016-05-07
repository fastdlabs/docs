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

        return $this->render('database/drivers.twig', [
            'write' => $write
        ]);
    }
}
```

获取后数据库连接后，即可以通过数据库连接驱动进行数据库操作。

##### ＃查询

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

`query($sql)` 方法是执行一个数据库语句操作，包括 `insert`，`select`，`update`，`delete`，而每个操作都有对应的结果获取。

如果是 `insert` 操作，那么可以通过 `execute` 后执行 `getId` 方法获取最后插入的 id，但是在分布式 id 发号器中并不适用。

如果是 `update` 操作，那么可以通过 `execute` 后执行 `getAffected` 获取影响的行数，`delete` 操作也一样。

如果是查询操作，那么可以通过 `getOne` 或者 `getAll` 分别获取 1 条纪录和多条记录结果集。

##### ＃PDO

如果以上封装并不能满足你业务上的操作，可以通过获取原生 `\PDO`  对象进行操作，这样跟 PHP 操作是一样的，除非 PHP 也没法满足你的业务需求。

```php
public function databaseAction(Request $request)
{
    $write = $this->getDriver('write');

    $pdo = $write->getPdo(); // 获取原生 \PDO 对象
    
    return $this->render('database/drivers.twig');
}
```

##### ＃预处理


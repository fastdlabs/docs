# 入门

FastD 框架让数据库链接和操作变得相对简单，目前框架提供的数据库支持仅是: MySQL，因为精力和能力有限，暂时仅支持MySQL，未来看发展需求和精力，适当扩展。

数据库配置文件: `app/config/config_*.php`

模块配置文件: `{bundle}/Resources/config/config.php`



##### ＃数据库配置规范:

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

##### ＃获取数据库连接驱动

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

##### ＃执行数据库语句

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

##### ＃预处理

`query($sql)` 方法的处理就是 `\PDO` 的 `prepare` 方法，因此在使用 `query` 方法的时候，其实是一个预处理的方式进行语句操作的，因此在操作方法的时候可以进行参数绑定。

```php
public function databaseAction(Request $request)
{
    $write = $this->getDriver('write');

    $write
        ->query('select * from test where id = :id')
        ->setParameters(['id' => 1])
    ;
    
    return $this->render('database/drivers.twig');
}
```

参数绑定此处会减少 PHP 本身的参数绑定中的 `:` 冒号，但其实在内部是会自动拼接 `:` 冒号。

参数绑定 `setParameters(array $parameters)` 接受多个参数，以二维数组的形式进行参数传递。

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

##### ＃Repository

数据库 `Repository` 相当于其他开发框架中的 `Model`，主要作用是用于数据处理和包装，这就是为什么要将数据包装到模型中，为了提高程序的可读性，灵活性，在控制器中是要禁止处理对应的 SQL 语句处理。

Repository 可以通过 `FastD\Database\DriverInterface::getRepository($name)`

```php
$repository = $write->getRepository($name);
```

参数需要完整说明 Repository 的类名。

除了 `getRepository` 方法获取之外，还可以直接实例化，因为 `getRepository` 方法最终仅是处理了 repository 实例化的工作.

源码:

```php
/**
 * @param string $repository
 * @return Repository
 * @throws \InvalidArgumentException
 */
public function getRepository($repository)
{
    $repository = str_replace(':', '\\', $repository);

    if (!class_exists($repository)) {
        throw new \InvalidArgumentException(sprintf('Repository class ["%s"] is not found.', $repository));
    }

    $repository = new $repository($this);

    return $repository;
}
```

在构造方法构造时，传递对应的连接驱动，即可实现一个 `Repository`。

```php
$repository = new TestRepository($write);
```

两者在原理实现上，效果是一致的。因此两种方式均可以实现 `Repository` 的实例化。

# 配置

框架中分为两种配置，一个是全局配置，全局配置根据运行环境而变化。另外一个则是模块配置，针对当前模块进行配置，也是模块独立的一部分。

全局配置文件: `app/config/config_(env).php`

模块配置文件: `{bundle}/Resources/config/config.php`

在系统引导的时候，系统会将所有配置文件进行合并，也就是如果配置文件中存在重复信息，则会被合并替代，所以在命名的时候要注意唯一性。

### 配置

配置的定义是用于程序上的读取，并对应执行操作，因此我们配置最大的作用就是改变程序不同的运行方式，达到定制化的目的。

例子，查看全局配置文件(dev): 

```php
<?php
return [
    // 数据库配置
    'database' => [
        'write' => [
            'type'     => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'user'     => 'root',
            'pwd'      => '',
            'charset'  => 'utf8',
            'dbname'     => '',
            'prefix'   => ''
        ],
        'read' => [
            'type'     => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'user'     => 'root',
            'pwd'      => '',
            'charset'  => 'utf8',
            'dbname'     => '',
            'prefix'   => ''
        ],
    ],
    // 存储配置
    'storage' => [
        'write' => [
            'type' => 'redis',
            'host' => '',
            'port' => 6379
        ],
    ],
];
```

我们在控制器中，可以通过 `Controller::getParameter($name)` 对配置文件进行读取。

```php
<?php

namespace WelcomeBundle\Controllers;

use FastD\Framework\Bundle\Controllers\Controller;

/**
 * Class Demo
 *
 * @Route("/demo")
 * @package WelcomeBundle\Controllers
 */
class Demo extends Controller
{
    // some code...

    /**
     * @Route("/config", name="config")
     *
     * @return \FastD\Http\Response|string
     */
    public function configAction()
    {
        $db = $this->getParameters('database');

        return $this->render('base/config.twig', [
            'config' => var_export($db, true),
        ]);
    }
}
```

以上会读取数据库配置数据，格式如下: 
```php
[
    'write' => [
        'type'     => 'mysql',
        'host'     => '127.0.0.1',
        'port'     => 3306,
        'user'     => 'root',
        'pwd'      => '',
        'charset'  => 'utf8',
        'dbname'     => '',
        'prefix'   => ''
    ],
    'read' => [
        'type'     => 'mysql',
        'host'     => '127.0.0.1',
        'port'     => 3306,
        'user'     => 'root',
        'pwd'      => '',
        'charset'  => 'utf8',
        'dbname'     => '',
        'prefix'   => ''
    ],
]
```

如果想要读取数组下制定某个单元的配置信息，也是可以，直接支持以 `.` 点号进行连接的。

例如需要获取数据库下读取(read)的连接。

```php
$db = $this->getParameters('database.read');
```

结果: 

```php
[
    'type'     => 'mysql',
    'host'     => '127.0.0.1',
    'port'     => 3306,
    'user'     => 'root',
    'pwd'      => '',
    'charset'  => 'utf8',
    'dbname'     => '',
    'prefix'   => ''
]
```

自定义的配置数据也是如此，可以对其执行制定数据的获取。

### 模块配置

每个模块都支持独立配置，但是独立配置有个点需要注意，就是要保证配置唯一，因为配置会在系统引导的时候进行合并，所以必须唯一。

配置上和全局配置保持一致，读取也保持一致。因此此处不展开独立介绍。

### 变量配置

系统中默认内置了4个动态配置变量，分别是: 

* root.path
* env
* debug
* version

动态配置有一个定界符，以 `%` 进行划分。

##### ＃如何使用动态配置

打开配置文件，在配置项的值中配置动态变量，`%root.path%` 在获取配置的时候，系统会将动态变量进行赋值替换，因为获取出来的地址应该是系统的根地址。

例子: 

```php
<?php
return [
    // 数据库配置
    'database' => [
        'write' => [
            'type'     => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'user'     => 'root',
            'pwd'      => '',
            'charset'  => 'utf8',
            'dbname'     => '',
            'prefix'   => ''
        ],
        'read' => [
            'type'     => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'user'     => 'root',
            'pwd'      => '',
            'charset'  => 'utf8',
            'dbname'     => '',
            'prefix'   => ''
        ],
    ],
    // 存储配置
    'storage' => [
        'write' => [
            'type' => 'redis',
            'host' => '',
            'port' => 6379
        ],
    ],
    'dynamic' => [
        'path' => '%root.path%'
    ]
];
```

**控制器**

```php
<?php

namespace WelcomeBundle\Controllers;

use FastD\Framework\Bundle\Controllers\Controller;

/**
 * Class Demo
 *
 * @Route("/demo")
 * @package WelcomeBundle\Controllers
 */
class Demo extends Controller
{
    // some code...

    /**
     * @Route("/config", name="config")
     *
     * @return \FastD\Http\Response|string
     */
    public function configAction()
    {
        $db = $this->getParameters('database');

        return $this->render('base/config.twig', [
            'config' => var_export($db, true),
            'path' => $this->getParameters('dynamic.path')
        ]);
    }
}
```

动态变量 `dynamic.path` 的值则会动态变化成系统的根目录地址。

而动态变量只有在精确获取动态变量的时候才会执行替换，若果在其他获取数组上，是不会执行替换操作的，因此这一点需要记住，记不住也没关系，用多了就熟悉了。

### 自定义动态配置

除了系统内置的动态变量意外，还可以针对个人自定义一些动态的配置，方便自己的操作习惯。

自定义配置需要在 `app/application.php` 中的 `registerConfigurationVariable(Config $config)` 进行配置，调用 `Config` 对象的  `setVariable` 方法即可。

```php
/**
 * @param Config $config
 */
public function registerConfigurationVariable(Config $config)
{
    $config->setVariable('name', 'janhuang');
}
```

配置文件添加自定义变量参数。

```php
<?php
return [
    // 数据库配置
    'database' => [
        'write' => [
            'type'     => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'user'     => 'root',
            'pwd'      => '',
            'charset'  => 'utf8',
            'dbname'     => '',
            'prefix'   => ''
        ],
        'read' => [
            'type'     => 'mysql',
            'host'     => '127.0.0.1',
            'port'     => 3306,
            'user'     => 'root',
            'pwd'      => '',
            'charset'  => 'utf8',
            'dbname'     => '',
            'prefix'   => ''
        ],
    ],
    // 存储配置
    'storage' => [
        'write' => [
            'type' => 'redis',
            'host' => '',
            'port' => 6379
        ],
    ],
    'dynamic' => [
        'path' => '%root.path%'
    ]
];
```

使用控制器进行对应调用

```php
<?php

namespace WelcomeBundle\Controllers;

use FastD\Framework\Bundle\Controllers\Controller;

/**
 * Class Demo
 *
 * @Route("/demo")
 * @package WelcomeBundle\Controllers
 */
class Demo extends Controller
{
    // some code...

    /**
     * @Route("/config", name="config")
     *
     * @return \FastD\Http\Response|string
     */
    public function configAction()
    {
        $db = $this->getParameters('database');

        return $this->render('base/config.twig', [
            'config' => var_export($db, true),
            'path' => $this->getParameters('dynamic.path')
        ]);
    }
}
```

### 配置缓存




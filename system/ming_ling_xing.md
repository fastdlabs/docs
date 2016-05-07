# 命令行

框架本身提供命令的方式对程序进行管理，具体参考了 Symfony 的设计与布局方式，因此在开发中也需要注意命令的使用，适当地使用命令可以大大提高开发的便利与健壮，但同时需要文档说明操作流程。

命令目录: `{bundle}/Commands`

###＃系统命令

命令可以通过基础控制台管理进行展示: 

```php
php bin/console 
```

程序展示所有内置的所有命令。

```php
asset:
 ➜ asset:install
bundle:
 ➜ bundle:generate
config:
 ➜ config:cache
db:
 ➜ db:revert
 ➜ db:update
production:
 ➜ production:init
route:
 ➜ route:cache
 ➜ route:dump
```

系统框架命令存在于 `fastd/framework` 中，源代码可以直接通过安装组件进行查看。

### ＃自定义命令行

自定义命令行在每个目录 `Commands` 下，而且命令会自动扫描文件进行添加，因为命令在 cli 模式下执行，所以可以更少考虑扫描文件产生的效率问题，应该把问题都集中在业务代码处理上。

```php
<?php

namespace WelcomeBundle\Commands;

use FastD\Console\Command\Command;
use FastD\Console\IO\Input;
use FastD\Console\IO\Output;

class DemoCommand extends Command
{
    /**
     * @return string
     */
    public function getName()
    {
        return 'welcome:bundle';
    }

    /**
     * @return void
     */
    public function configure()
    {
        // TODO: Implement configure() method.
    }

    /**
     * @param Input $input
     * @param Output $output
     * @return int
     */
    public function execute(Input $input, Output $output)
    {
        $output->write('welcome fastd');
    }
}
```

继续刚才最基础的命令: 

```php
php bin/console
```

输出: 

```php
welcome:
 ➜ welcome:bundle
asset:
 ➜ asset:install
bundle:
 ➜ bundle:generate
config:
 ➜ config:cache
db:
 ➜ db:revert
 ➜ db:update
production:
 ➜ production:init
route:
 ➜ route:cache
 ➜ route:dump
```

会发现，自定义的命令会自动显示到列表当中 `welcome:bundle`，而每个模块下的命令并不是自动分组的，而是在实现 `getName` 方法的时候，通过返回值中的第一个参数进行分组，比如上述的 `welcome:bundle`, 那么就会按照 `welcome` 进行分组。

```php
php bin/console welcome:bundle
```

命令后要接上命令行的名字，也就是 `getName` 方法中返回的名字。就会执行命令的 `execute` 方法。

输出: `welcome fastd`

##### ＃设置命令行参数

命令行是可以设置对应的命令参数的，例如系统内置的参数 `--env=dev`，如果没有 `env` 参数，则环境默认为 `dev` 环境执行。

在命令行类中，可以通过 `FastD\Console\Command\Command::setOption($name, $optional, $desc)` 设置选项，`FastD\Console\Command\Command::setArgument($name, $optional, $desc)` 设置参数。

命令行配置需要在 `configure` 方法中进行配置初始化，其他地方无效。

##### ＃参数和选项的区别

参数是指命令行后，接受的参数数量。而选项，则是命令行后面需要使用 `-` 或者 `--` 进行配置的，我们称之为选项。

##### ＃在命令行中获取应用核心

```php
$kernel = $this->getApplication()->getKernel(); // AppKernel
```

方法会返回整个运行的核心，
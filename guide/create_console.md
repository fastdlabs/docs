# 创建命令行

fastd 项目中存在另外一个强大而又实用工具: `bin/console`。

```shell
$ php bin/console
```

你应该看到一个命令列表，可以给你调试信息，帮助生成代码，生成数据库迁移等等。 当你安装更多的以来扩展时，你会看到更多的命令。

如果需要获取应用所有的路由列表，请使用 `route` 命令

```shell
$ php bin/console route
```

```git
+---------------+--------+---------------------------------------+------------+
| Path          | Method | Callback                              | Middleware |
+---------------+--------+---------------------------------------+------------+
| /             | GET    | \Controller\WelcomeController@welcome |            |
| /hello/{name} | GET    | \Controller\HelloController@hello     | man        |
+---------------+--------+---------------------------------------+------------+
```

如果想要获取更多的命令参数，可以通过 `--help`，`-h` 选项进行获取。

```shell
$ php bin/console route -h
```

```git
Usage:
  route [options] [--] [<method>] [<path>]

Arguments:
  method                Route request method.
  path                  Route path.

Options:
  -d, --data[=DATA]     Path request data.
  -a, --all[=ALL]       Test all routes
  -h, --help            Display this help message
  -q, --quiet           Do not output any message
  -V, --version         Display this application version
      --ansi            Force ANSI output
      --no-ansi         Disable ANSI output
  -n, --no-interaction  Do not ask any interactive question
  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Help:
  Show all route
```

了解使用后，现在，我们来创建我们的命令行工具。

```php
<?php

namespace Console;


use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class HelloConsole extends Command
{
    public function configure()
    {
        $this->setName('hello');
        $this->addArgument('name', InputArgument::OPTIONAL, '', 'jan');
    }

    public function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('hello '.$input->getArgument('name'));
    }
}
```

```shell
$ php bin/console hello jan
// hello jan
```

由于我们功能实现引用了 `Symfony/console`。

更多操作与使用可以通过官网文档进行查看: [点这里](http://symfony.com/doc/current/components/console.html)

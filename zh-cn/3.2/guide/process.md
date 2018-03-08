# 创建进程

fastd 内部进程依赖 swoole，因此在使用该功能前，请确保当前 swoole 环境是否已经成功安装。

创建进程，仅需两步:

1. 创建进程类: 进程所执行的逻辑
2. 注册到配置文件: `config/process.php`

!> 值得注意的是，进程中如果需要保持在后台运行，需要在进程中设置"死循环"，让其一直执行，否则会在逻辑代码执行完成后，进程退出。

```php
<?php

namespace Process;

use FastD\Process\AbstractProcess;
use swoole_process;

class HelloProcess extends AbstractProcess
{
    public function handle(swoole_process $swoole_process)
    {
        timer_tick(1000, function ($id) {
            static $index = 0;
            ++$index;
            echo $index.PHP_EOL;
            if ($index === 3) {
                timer_clear($id);
            }
        });
    }
}
```

以上程序每秒输出 `$index`，直到 `$index == 3` 时，进程退出，父进程进行回收。

注册到配置文件中(`config/process.php`):

```php
<?php

return [
    'demo' => [
        'process' => \Process\HelloProcess::class,
        'options' => [

        ],
    ],
];
```

```shell
$ php bin/console process demo
```

输出:

```text
process demo pid: 15894
pid: fastd-demo/runtime/process/demo.pid
1
2
3
process: demo. pid: 15894 exit. code: 0. signal: 0
```

`process` 命令包含几个命令，可以通过 `-h` 进行查看:

```shell
$ php bin/process -h
```

```text
Usage:
  process [options] [--] [<process>] [<action>]

Arguments:
  process               process name
  action                process action, status|start|stop [default: "status"]

Options:
  -p, --pid[=PID]       set process pid path.
      --name[=NAME]     set process name.
  -d, --daemon          set process daemonize.
  -h, --help            Display this help message
  -q, --quiet           Do not output any message
  -V, --version         Display this application version
      --ansi            Force ANSI output
      --no-ansi         Disable ANSI output
  -n, --no-interaction  Do not ask any interactive question
  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Help:
  Create new processor.
```

?> 除了可以单独运行外，还能直接注入到 swoole server 中执行。😎

# Create process

The fastd internal process depends on swoole, so before using this feature, make sure that the current swoole environment is installed successfully.

Create a process in just two steps:

1. Create a process class: the logic performed by the process
2. Register to the configuration file: `config/process.php`

!> It is worth noting that if you need to keep running in the background during the process, you need to set an "endless loop" in the process to keep it executing. Otherwise, the process exits after the logic code is executed.

`` `php
<? php

namespace Process

use FastD \ Process \ AbstractProcess;
use swoole_process;

Class HelloProcess extends AbstractProcess
{
    public function handle (swoole_process $ swoole_process)
    {
        timer_tick (1000, function ($ id) {
            Static $index = 0;
            ++$index;
            echo $ index.PHP_EOL;
            if ($ index === 3) {
                timer_clear ($ id);
            }
        });
    }
}
`` `

The above program outputs `$index` every second until `$index == 3`, the process exits and the parent process is recycled.

Registered in the configuration file (`config/process.php`):

`` `php
<? php

return [
    'demo' => [
        'process' => \ Process \ HelloProcess :: class,
        'options' => [

        ],
    ],
];
`` `

`` `shell
$ php bin/console process demo
`` `

Output:

```text
Process demo pid: 15894
pid: fastd-demo / runtime / process / demo.pid
1
2
3
Process: demo. pid: 15894 exit. code: 0. signal: 0
`` `

The `process` command contains several commands that can be checked by` -h`:

`` `shell
$ php bin/process -h
`` `

```text
Usage:
  Process [options] [--] [<process>] [<action>]

Arguments:
  Process process name
  Action process action, status|start|stop [default: "status"]

Options:
  -p, --pid [= PID] set process pid path.
      --name [= NAME] set process name.
  -d, --daemon set process daemonize.
  -h, --help Display this help message
  -q, --quiet Do not output any message
  -V, --version Display this application version
      --ansi Force ANSI output
      --no-ansi Disable ANSI output
  -n, --no-interaction Do not ask any interactive question
  -v | vv | vvv, --verbose Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Help:
  Create new processor.
`` `

?> In addition to running alone, but also directly into swoole server implementation. 😎...
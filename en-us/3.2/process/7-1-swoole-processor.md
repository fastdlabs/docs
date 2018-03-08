# Swoole Process Management

The operation process is as simple as operating the command line, since the process does not depend on any environment. Of course, if you use the system built-in functions or objects, then you still need to deal with the dependencies

#### create process

It is worth noting that here the process and swoole built-in process, he and the server itself is running independently, so you do not need to rely on the creation of the server.

> Process Support Server used and run separately.
 
Create process file:

```php
namespace Processor;


use FastD\Swoole\Process;
use swoole_process;

class DemoProcessor extends Process
{
    public function handle(swoole_process $swoole_process)
    {
        timer_tick(1000, function ($id) {
            static $index = 0;
            $index++;
            echo $index . PHP_EOL;
            if ($index === 3) {
                timer_clear($id);
            }
        });
    }
}
```

> The process must inherit the `FastD\Swoole\Process` object, implementing: the `handle` method, otherwise it will not run

#### Start the process

```
php bin/console process:create {ProcessName} [--name] [--daemon|-d]
```

Command will save the process file information, such as: pid, save the directory in the `runtime/process` directory

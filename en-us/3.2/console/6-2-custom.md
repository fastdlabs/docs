# Custom command

The command line depends on the [symfony/console](https://github.com/symfony/console) specific operation can view [console](http://symfony.com/doc/current/console.html)

Version: `^ 3.2`

All command-line files are stored in the `src/Console` directory. The command line object needs to inherit `Symfony\Component\Console\Command\Command`. When the console console object is started, the program automatically scans all command line files in the directory , And processed.

```php
<?php

namespace Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;


class Demo extends Command
{
    public function configure()
    {
        $this->setName('demo');
    }

    public function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('hello world');
    }
}
```

See more: [console](http://symfony.com/doc/current/console.html)

#### Registration command line

By default, the command line is usually stored in the `src / Console` directory. For some special cases, for example, if I need to register a command line in an extension package, I need to manually register the command line.

The framework itself provides two registration methods, one is configuration file registration, and the other is by registering manually in the service provider `register` method.

```php
class FooServiceProvider implements ServiceProviderInterface
{
    public function register(Container $container)
    {
        $container->add('foo', new Foo());
        config()->merge([
            'consoles' => [
                DemoConsole::class
            ]
        ]);
    }
}
```

Code analysis:

In the system, the command line application will execute the following code, used to register user-defined commands, and the command to the configuration, then only need to add the command line object to the configuration, you can achieve the registration effect.

```php
foreach (config()->get('consoles', []) as $console) {
    $this->add(new $console());
}
```
Next Section: [Unit Testing](en-us/3.2/advanced/3-1-testcase.md)
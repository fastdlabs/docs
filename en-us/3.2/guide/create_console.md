# Create a command line

There is another powerful but useful tool in the fastd project: `bin / console`.

`` `shell
$ php bin / console
`` `

You should see a list of commands that you can use to debug information, help generate code, generate database migrations, and more. When you install more extensions since, you will see more commands.

If you need to get a list of all your routes, use the `route` command

`` `shell
$ php bin / console route
`` `

`` `git
+ --------------- + -------- + ------------------------ --------------- + ------------ +
Path | Method | Callback | Middleware |
+ --------------- + -------- + ------------------------ --------------- + ------------ +
| / | GET | \Controller\WelcomeController@welcome |
| / hello / {name} | GET | \Controller\HelloController@hello | man |
+ --------------- + -------- + ------------------------ --------------- + ------------ +
`` `

If you want to get more command parameters, you can use `--help`,` -h` option to get.

`` `shell
$ php bin / console route -h
`` `

```git
Usage:
  route [options] [-] [<method>] [<path>]

Arguments:
  Method Route request method.
  path Route path.

Options:
  -d, --data[=DATA] Path request data.
  -a, --all [= ALL] Test all routes
  -h, --help Display this help message
  -q, --quiet Do not output any message
  -V, --version Display this application version
      --ansi Force ANSI output
      --no-ansi Disable ANSI output
  -n, --no-interaction Do not ask any interactive question
  -v | vv | vvv, --verbose Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Help:
  Show all route
`` `

Learn to use, now, let's create our command line tool.

`` `php
<? php

namespace Console


use Symfony \ Component \ Console \ Command \ Command;
use Symfony \ Component \ Console \ Input \ InputArgument;
use Symfony \ Component \ Console \ Input \ InputInterface;
use Symfony \ Component \ Console \ Output \ OutputInterface;

class HelloConsole extends Command
{
    public function configure ()
    {
        $ this-> setName ('hello');
        $this->addArgument('name', InputArgument::OPTIONAL, '', 'jan');
    }

    public function execute (InputInterface $ input, OutputInterface $ output)
    {
        $output->writeln('hello '.$input->getArgument('name'));
    }
}
`` `

`` `shell
$ php bin / console hello jan
// hello jan
`` `

Symfony / console is referenced because of our functional implementation.

More operations and use can be viewed through the official website documentation: [click here] (http://symfony.com/doc/current/components/console.html)
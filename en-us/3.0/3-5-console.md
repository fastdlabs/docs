# Command Line

The command line depends on the [symfony / console] (https://github.com/symfony/console) specific operation can view [console] (http://symfony.com/doc/current/console.html)

Version: `^ 3.2`

All command-line files are stored in the `src / Console` directory. The command line object needs to inherit` Symfony \ Component \ Console \ Command \ Command`. When the console console object is started, the program automatically scans all command line files in the directory , And processed.
 
`` `php
namespace Console

use Symfony \ Component \ Console \ Command \ Command;
use Symfony \ Component \ Console \ Input \ InputInterface;
use Symfony \ Component \ Console \ Output \ OutputInterface;


class Demo extends Command
{
     public function configure ()
     {
         $ this-> setName ('demo');
     }

     public function execute (InputInterface $ input, OutputInterface $ output)
     {
         $ output-> writeln ('hello world');
     }
}
`` `

See more: [console] (http://symfony.com/doc/current/console.html)

Next Section: [Unit Testing] (en-us / 3.0 / 3-6-testcase.md)
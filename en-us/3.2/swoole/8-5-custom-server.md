# Customize the server

When our built-in servers are not enough to support the needs of the business, you can meet your business needs by implementing your own server.

Implementing your own server is fairly straightforward, and if you're a first-time friend you can learn about the official example: [swoole](http://www.swoole.com/)

In addition, due to the use of the `fastd/swoole` component in the framework, some of the internal processes and demos also need to be understood. Example: [fastd/swoole](https://github.com/JanHuang/swoole)

Example:

```php
<?php

namespace Server;


use FastD\Servitization\Server\HTTPServer;
use swoole_server;

class TaskServer extends HTTPServer
{
    public function doTask(swoole_server $server, $data, $taskId, $workerId)
    {
        echo $data . PHP_EOL;
    }
}
```

Built-in server:

* `FastD\Servitization\Server\TCPServer`
* `FastD\Servitization\Server\UDPServer`
* `FastD\Servitization\Server\HTTPServer`
* `FastD\Servitization\Server\WebSocketServer`

Select the type of server you need to implement, and then inherit and then implement or override the internal methods.

> All servers have now implemented `doTask` method, which can be achieved by friends who need to use asynchronous tasks to achieve the desired effect.
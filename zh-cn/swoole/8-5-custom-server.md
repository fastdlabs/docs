# 自定义服务器

当我们内置的服务器不足以支撑满足业务需求的时候，可以通过实现自己的服务器来满足业务的需求。

实现自己的服务器是相当简单的，如果初次尝试的朋友可以了解一下官方的例子: [swoole](http://www.swoole.com/)

另外，因为框架中使用 `fastd/swoole` 组件，内部分装的一些流程和demo也需要去了解一下。例子: [fastd/swoole](https://github.com/JanHuang/swoole)

示例:

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

内置的服务器:

* `FastD\Servitization\Server\TCPServer`
* `FastD\Servitization\Server\UDPServer`
* `FastD\Servitization\Server\HTTPServer`
* `FastD\Servitization\Server\WebSocketServer`

选择你需要实现的服务器类型，对应继承，然后实现或者重写内部方法。

> 目前所有服务器都已经实现 `doTask` 方法，如果需要使用异步任务的朋友可以实现该方法来达到想要的效果。
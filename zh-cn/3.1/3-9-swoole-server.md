# Swoole 服务器

Swoole 服务器依赖于 [swoole](https://github.com/JanHuang/swoole) 并且提供灵活优雅的实现方式。

> swoole 必须依赖于 ext-swoole 扩展，并且版本 >= 1.9.6

swoole 服务器的配置文件存放在 `config/server.php` 中，其中 `host` 选项是必填，`options` 配置项请看 [server 配置选项](http://wiki.swoole.com/wiki/page/274.html)

```php
$ php bin/server {start|status|stop|reload} [-d: 守护进程] [-t: web root 目录，默认使用当前命令执行路径]
```

默认操作方式是 `status`，可用于简单查看进程状态。

> 访问的方式与 FPM 下访问保持一致。开发环境下推荐使用 FPM，生产环境可以尝试用 Swoole 代替 FPM，如果有必要的话

### 守护进程

以守护进程的方式启动，只需要加一个 `--daemon|-d` 选项即可。

```php
$ php bin/server {start|status|stop|reload} -d > /dev/null
```

启动守护进程需要屏蔽输出，屏蔽输出仅仅是屏蔽输出而已，并不会对程序和性能造成影响。

以上即可通过不修改代码，支持 Swoole 操作。

### 多端口监听

服务器支持多端口监听，只需要简单的配置。

```php
<?php 

return [
    'host' => 'http://0.0.0.0:9527',
    'class' => \FastD\Servitization\Server\HTTPServer::class,
    'options' => [
        'pid_file' => __DIR__ . '/../runtime/pid/' . app()->getName() . '.pid',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'listeners' => [
        [
            'class' => \FastD\Servitization\Server\TCPServer::class,
            'host' => 'tcp://127.0.0.1:9528',
            'options' => [

            ]
        ],
        [
            'class' => \FastD\Servitization\Server\ManagerServer::class,
            'host' => 'tcp://127.0.0.1:9529',
        ],
    ],
];
```

框架提供一个默认的 TCP 服务，以提供 TCP 调用，可以通过创建发现服务器，监控实现一套 RPC 系统。

每个需要监听的端口需要继承 `FastD\Swoole\Server` 对象，实现内部抽象方法，具体请查看 [examples](https://github.com/JanHuang/swoole/blob/master/examples/multi_port_server.php)

**注意事项**

`swoole_http_server` 和 `swoole_websocket_server` 因为是使用继承子类实现的，无法使用 listen 创建 Http/WebSocket 服务器。如果服务器的主要功能为RPC，但希望提供一个简单的Web管理界面。

在这样的场景中，可以先创建 Http/WebSocket 服务器，然后再进行 listen 监听 RPC 服务器的端口。

因为多端口是共享进程处理的，所以如果要使用 task 任务处理，需要在主服务器中处理 `doTask` 回调方法。 

* [Swoole 监听端口](http://wiki.swoole.com/wiki/page/525.html)

### 服务器进程

服务器内置 Process 进程，在启动服务器的时候会自动拉起进程，通过 [Swoole::addProcess](http://wiki.swoole.com/wiki/page/390.html) 实现。

配置依然是 [server.php](../../tests/app/default/config/server.php)。

```php
<?php

return [
    'host' => 'http://0.0.0.0:9527',
    'class' => \FastD\Servitization\Server\HTTPServer::class,
    'options' => [
        'pid_file' => __DIR__ . '/../runtime/pid/' . app()->getName() . '.pid',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [

    ],
];
```

重写 `FastD\Swoole\Process` 的 `handle` 方法，`handle` 为进程具体执行的事务。示例: [DemoProcessor](../../tests/app/src/Processor/DemoProcessor.php)

##### 完整的配置

```php
<?php
return [
    'listen' => 'http://0.0.0.0:9527',
    'class' => \FastD\Servitization\Server\HTTPServer::class,
    'options' => [
        'pid_file' => '',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [
        
    ],
    'listeners' => [
       [
           'class' => \FastD\Servitization\Server\TCPServer::class,
           'host' => 'tcp://127.0.0.1:9528',
       ]
    ],
];
```

### Task 服务器

在 swoole 组件中，已经实现了 Swoole Task 功能，可以通过集成扩展的方式实现自己的 Task 服务器。如下: 

##### Server\TaskServer

```php
<?php

namespace Server;


use FastD\Servitization\Server\HTTPServer;
use Psr\Http\Message\ServerRequestInterface;
use swoole_server;

class TaskServer extends HTTPServer
{
    public function doTask(swoole_server $server, $data, $taskId, $workerId)
    {
        echo $data . PHP_EOL;
    }

    public function doRequest(ServerRequestInterface $serverRequest)
    {
        $response = parent::doRequest($serverRequest); // TODO: Change the autogenerated stub

        server()->task("some data");

        return $response;
    }
}
```

调整配置: 

```php
<?php

return [
    'host' => 'http://0.0.0.0:9527',
    'class' => \Server\TaskServer::class,
    'options' => [
        'pid_file' => __DIR__ . '/../runtime/pid/' . app()->getName() . '.pid',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [

    ],
    'listeners' => [
        [
            'class' => \FastD\Servitization\Server\TCPServer::class,
            'host' => 'tcp://127.0.0.1:9528',
        ]
    ],
];
```

即可实现 task 服务器

### Swoole 客户端

除了提供 Swoole Server 以外，还提供一个远程操作的 Client 连接端客户，在服务器启动后，可以通过客户端，对远程服务器进行管理。

使用: `php bin/client schema://host:port` 

根据提示，输入具体操作的命令。

下一节: [扩展](zh-cn/3.1/3-10-connection-pool.md)
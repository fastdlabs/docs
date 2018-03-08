# Create server

Since fastd natively supports swoole, it is still relatively well-integrated.

fastd built-in WebSocket, HTTP, TCP, UDP, Task server, to enable developers to experience fast performance. Just one step:

Configuration file (`config / server.php`):

```php
<?php

return [
    'host' => get_local_ip().':9999',
    'class' => \Server\TaskServer::class,
    'options' => [
        'pid_file' => __DIR__ . '/../runtime/pid/' . app()->getName() . '.pid',
        'log_file' => __DIR__ . '/../runtime/logs/' . app()->getName() . '.pid',
        'log_level' => 5,
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [
        
    ],
    'listeners' => [
        [
            'host' => '0.0.0.0:9528',
            'class' => \FastD\Servitization\Server\TCPServer::class
        ]
    ],
];
```

The main configuration needs to adjust the `class` option. Built-in service list:

1. `FastD\Servitization\Server\HTTPServer`
2. `FastD\Servitization\Server\TCPServer`
3. `FastD\Servitization\Server\UDPServer`
4. `FastD\Servitization\Server\WebSocketServer`

`` `shell
$ php bin/server start
`` `

```text
Server: dobee
App version: 2.1.0
Swoole version: 1.9.23
Listen: http://0.0.0.0:9527
  > Listen: tcp://0.0.0.0:9528
PID file: fastd-demo/config/../runtime/pid/dobee.pid, PID: 22074
```

After launching, corresponding visit: http://127.0.0.1:9527/ will get the corresponding result.

## combination process

In our development process, in fact, seamless integration into the Server, just add to the configuration file.

```php
<?php

return [
    'host' => '0.0.0.0:9527',
    'class' => \Server\TaskServer::class,
    'options' => [
        'pid_file' => __DIR__ . '/../runtime/pid/' . app()->getName() . '.pid',
        'log_file' => __DIR__ . '/../runtime/logs/' . app()->getName() . '.pid',
        'log_level' => 5,
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [
        \Process\HelloProcess::class
    ],
    'listeners' => [
        [
            'host' => '0.0.0.0:9528',
            'class' => \FastD\Servitization\Server\TCPServer::class
        ]
    ],
];
```

```shell
$ php bin/server start
```

```text
Server: dobee
App version: 2.1.0
Swoole version: 1.9.23
Listen: http://0.0.0.0:9527
  > Listen: tcp://0.0.0.0:9528
PID file: /Users/janhuang/Documents/htdocs/me/fastd/fastd-demo/config/../runtime/pid/dobee.pid, PID: 22074
1
2
3
```

If you need to daemonize the server, you need to add the `-d` option.

```shell
$ php bin/server start -d 
```
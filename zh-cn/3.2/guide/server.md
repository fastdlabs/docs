# 创建服务器

由于 fastd 天生支持 swoole，因此在结合上还是相对比较完善的。

fastd 内置 WebSocket、HTTP、TCP、UDP、Task 服务器，能够快速让开发者体验极速的性能。仅需一步:

配置文件(`config/server.php`): 

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

主要配置需要调整 `class` 选项。内置服务列表:

1. `FastD\Servitization\Server\HTTPServer`
2. `FastD\Servitization\Server\TCPServer`
3. `FastD\Servitization\Server\UDPServer`
4. `FastD\Servitization\Server\WebSocketServer`

```shell
$ php bin/server start
```

```text
Server: dobee
App version: 2.1.0
Swoole version: 1.9.23
Listen: http://0.0.0.0:9527
  > Listen: tcp://0.0.0.0:9528
PID file: fastd-demo/config/../runtime/pid/dobee.pid, PID: 22074
```

启动后，对应访问: http://127.0.0.1:9527/ 即可得到对应结果。

## 结合进程

在我们开发完的进程，其实也可以无痕整合到 Server 中，仅需添加到配置文件中。

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

如果你需要将服务器守护进程化，需要添加 `-d` 选项。

```shell
$ php bin/server start -d 
```

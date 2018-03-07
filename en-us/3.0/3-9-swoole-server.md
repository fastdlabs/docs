# Swoole server

Swoole server relies on [swoole] (https://github.com/JanHuang/swoole) and provides a flexible and elegant implementation.

> swoole must rely on the ext-swoole extension, and version> = 1.8.5

swoole server configuration files stored in `config / server.php`, which` listen` option is required, `options` configuration items see [server configuration options] (http://wiki.swoole.com/wiki/ page / 274.html)

`` `php
$ php bin / server {start | status | stop | reload} [-t] {web root directory, the default using the current command execution path}
`` `

The default mode of operation is `status`, which can be used to simply view the process status.

> The way to visit is consistent with the visit under FPM. It is recommended to use FPM in the development environment, and the production environment can try Swoole instead of FPM. If necessary

### daemon

To start daemon, just add a `--daemon | -d` option.

`` `php
$ php bin / server {start | status | stop | reload} -d> / dev / null
`` `

Start the daemon need to shield the output, the shield output is only the shield output only, and does not affect the program and performance.

Above can not modify the code to support Swoole operation.

### file monitoring

File listeners need to rely on [inotify] (https://pecl.php.net/package/inotify) extensions that need to be installed by themselves.

`` `php
$ php bin / server watch --dir = Need to monitor the directory
`` `

When monitoring the directory changes, the server will automatically restart, it is recommended to enable in development mode.

### Multi-port snooping

Server supports multi-port monitoring, only need a simple configuration.

`` `php
return [
    'listen' => 'http://0.0.0.0:9527',
    'options' => [
        'pid_file' => '',
        worker_num '=> 10
    ],
    // Multi-port monitoring
    'ports' => [
        [
            'class' => \ FastD \ Server \ TCPServer :: class,
            'listen' => 'tcp: //127.0.0.1: 9528',
            'options' => [
                
            ],
        ],
    ],
];
`` `

The framework provides a default TCP service to provide TCP calls, which can be implemented by creating a discovery server and monitoring an RPC system.

Each port to be monitored needs to inherit the `FastD \ Swoole \ Server` object and implement the internal abstract method as shown in [examples] (https://github.com/JanHuang/swoole/blob/master/examples/multi_port_server.php )

**Precautions**

swoole_http_server and swoole_websocket_server can not use listen to create the Http / WebSocket server because they are inherited subclasses. If the server's main function is RPC, but want to provide a simple Web management interface.

In this scenario, you can create an Http / WebSocket server and then listen for the listener's RPC server port.

* [Swoole listening port] (http://wiki.swoole.com/wiki/page/525.html)

### server process

Process server built-in process, when the server is started, it will automatically pull up the process, through [Swoole :: addProcess] (http://wiki.swoole.com/wiki/page/390.html).

The configuration is still [server.php] (../../ tests / config / server.php).

`` `php
return [
    'listen' => 'http://0.0.0.0:9527',
    'options' => [
        'pid_file' => '',
        worker_num '=> 10
    ],
    'processes' => [
        'class' => \ Processor \ DemoProcessor :: class
    ],
];
`` `

Rewrite `` `` handle` method of `FastD \ Swoole \ Process`,` handle` is a transaction that is executed by the process. Example: [DemoProcessor] (../../ tests / src / Processor / DemoProcessor.php)

Next Section: [Extensions] (en-us / 3.0 / 3-10-extend.md)
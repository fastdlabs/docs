# RPC service

Based on the Swoole extension, can easily achieve network communication between PHP, RPC services can also be well achieved, recommended learning RPC entry framework:

* [Dora-RPC] (https://github.com/xcl3721/Dora-RPC)

First understand a map [! [RPC] (https://github.com/weibocom/motan/wiki/media/14612349319195.jpg)]

Each time we implement a service, we need to register the added service to the discovery center immediately. When the client initiates the call, the service can be discovered by the discovery center and loaded into the designated backend server by using the specified algorithm.

In fact, the internal is a network communication process, the server needs to take the initiative to tell the discovery of "own" existence, found that the end received, you can determine the service is available.

#### Start the basic service

Framework to achieve the basic server functions, support for HTTP, TCP multi-port listening service monitoring, service is not recommended to use UDP form of management.

Set the `ports` configuration for` config / server.php` and add the built-in `TCPServer` as follows:

`` `php
<? php
return [
    'listen' => 'http://0.0.0.0:9527',
    'options' => [
        'pid_file' => '',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'ports' => [
        [
            'class' => \ FastD \ Server \ TCPServer :: class,
            'listen' => 'tcp: //127.0.0.1: 9528',
        ],
    ],
];
`` `

#### Enable service status reporting

Server status report, you need to open a monitor [Discovery] (https://github.com/JanHuang/discovery) server that accepts the server status (which can be achieved through the FastD API framework), and then write a process of reporting status, entered into Reporting mechanism, the state of regular reporting.

Open the discovery and monitoring ends, add the status report process.

`` `php
return [
    'listen' => 'http://0.0.0.0:9527',
    'options' => [
        'pid_file' => '',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'discovery' => [
        'tcp: //127.0.0.1: 9888'
    ],
    'monitor' => [
        'tcp: //127.0.0.1: 9889'
    ],
    'processes' => [
        \ FastD \ Discovery \ Discover :: class
    ],
    'ports' => [
        [
            'class' => \ FastD \ Server \ TCPServer :: class,
            'listen' => 'tcp: //127.0.0.1: 9528',
        ],
    ],
];
`` `

After the Discover process is started, the process automatically reports the current service status after the service starts, 1s apart.

If the monitor is also configured, then the request will receive the chain, parameters, services and other information reported to the monitoring terminal.
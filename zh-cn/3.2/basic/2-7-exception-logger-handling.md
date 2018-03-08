# 异常与日志处理

框架中提供基础错误处理，可以集中式处理各种异常。日志默认存储路径在 `runtime/logs` 中，可以通过业务需求，将日志集中发送到一个日志服务器中.

### 异常响应

根据配置, 框架中的异常会通过 `json` 的形式返回到客户端, 并记录到日志.

应用基础配置中异常处理配置示例:

```php
<?php
 
return [
    // some code
    'exception' => [
        'response' => function (Exception $e) {
            return [
                'msg' => $e->getMessage(),
                'code' => $e->getCode(),
            ];
        },
        'log' => function (Exception $e) {
            return [
                'msg' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
            ];
        }
    ],
    // some code
];
```

当应用程序放生异常的时候，会根据 `exception.response` 配置的选项响应给客户端，并且会将异常日志按照 `exception.log` 配置项记录到日志文件，默认在: `runtime/logs` 中存储。

### 本地文件记录

日志服务依赖于 [monolog](https://github.com/Seldaek/monolog)，当应用程序发生异常时，程序会将异常信息记录在日志中。

配置: 

```php
<?php
return [
    'log' => [
        [\Monolog\Handler\StreamHandler::class, 'error.log', \Monolog\Logger::ERROR]
    ],
];
```

数组接受 4 个参数，分别解析成: handler, log file, level, formatter

### socket 远端存储

当我们应用分布过多的时候，就需要考虑如何将日志集中管理起来，方便排查，分析。如果利用 Swoole 即将是一件容易实现的事情。启动我们的日志服务器，然后将每个应用日志都投递到日志服务器中。

应用中仅需要提交数据，数据处理就可以在日志服务器中完成。monolog 中可以使用 [monolog-reader](https://github.com/RunnerLee/monolog-reader) 进行解析。

```php
<?php
return [
    'log' => [
        [new \Monolog\Handler\SocketHandler('schema://host:port'), 'error.log', \Monolog\Logger::ERROR]
    ],
];
```

服务器接收提交信息后，对日志进行解析，批量入库，然后对应做响应的处理即可。

### LogStash 日志格式

档如果我们日志分析系统使用 ELK 进行处理的时候，可以使用 `\FastD\Logger\Formatter\StashFormatter` 日志格式进行存储。

修改配置:

```php
<?php

return [
    // some code
    'log' => [
        [
            \Monolog\Handler\StreamHandler::class,
            'info.log',
            \FastD\Logger\Logger::INFO,
            \FastD\Logger\Formatter\StashFormatter::class,
        ],
    ],
    // some code
];
```

然后启动 logstash agent，采集日志，即完成配置。

完整教程: [FastD 最佳实践五: 构建ELK日志分析系统](http://blog.fastdlabs.com/2017-12-12/create-log)

下一节: [单元测试](zh-cn/3.2/advanced/3-1-testcase.md)

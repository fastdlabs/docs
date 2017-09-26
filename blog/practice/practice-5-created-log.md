过去咱们开发中，对日志这个环节其实并不太重视，直到有一天，应用出现异常，这个时候才想起来“日志”，但很可惜，为时已晚。

咱们做运维和开发，除了救火，还需要防火，因此一些防范的意识也是非常重要的。

### 效果图

![](https://sfault-image.b0.upaiyun.com/324/593/3245932138-59b7c152ac5b7_articlex)

### 安装ELK

安装 [ELK](https://www.elastic.co) 是相对简单的，但是后期也需要对其进行优化，适当考虑运维人力，如果觉得个人可以折腾的不放可以尝试。

如果已经存在 ELK 环境，可以直接跳过，进行框架日志配置环节。

点击前往: [中文地址](https://kibana.logstash.es/content/)

##### 先决条件: Java 8

```
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get update
sudo apt-get -y install oracle-java8-installer
```

##### 简单安装 elasticsearch

下载地址: [elasticsearch](https://www.elastic.co/downloads/elasticsearch)

下载 zip 或者其他都可以。

解压压缩包。执行:

> 运行前请配置好系统参数。有一定要求，如果启动失败，仔细留意错误信息，对应调整即可。

```
bin/elasticsearch
```

验证:

```
curl http://localhost:9200/
```

##### 安装 kibana

下载地址: [kibana](https://www.elastic.co/downloads/kibana)

设置 elasticsearch url 地址，也就是刚才的 localhost:9200 (默认)

运行: `./bin/kibana`

打开: http://localhost:5601 访问面板

##### 安装 logstash

下载地址: [logstash](https://www.elastic.co/downloads/logstash)

配置文件: `config/logstash.conf`

可参照:

```config
input {
    file {
        type => "fastd"
        path => ["log file path"]
    }
}

filter {
    json {
        source => "message"
    }
}

output {
    # stdout { codec => rubydebug }
    elasticsearch {
        action => "index"
        hosts => "127.0.0.1:9200"
        index => "fastd"
    }
}
```

运行: `bin/logstash -f config/logstash.conf`

`stdout` 作为标准输出，可以通过 `stdout { codec => rubydebug }` 对采集数据进行调试。

### 处理 php 应用日志 (FastD 3.2新特性)

庆幸我们有这么一个需求，也能将工作经验总结并形成最终的解决方案分享给大家。

**!!3.1 版本处理方案**

新建格式日志文件。然后往下按照步骤进行处理即可(命名空间自定义，添加到日志配置中的第四个参数中)。

```php
<?php
namespace Logger\Formatter;

use Monolog\Formatter\LogstashFormatter;

/**
 * Class StashFormatter.
 */
class StashFormatter extends LogstashFormatter
{
    public function __construct()
    {
        parent::__construct(app()->getName(), get_local_ip(), null, null, self::V1);
    }
}

```

配置 `app.php`

```php
<?php

return [
    // code ...
    'log' => [
        [
            \Monolog\Handler\StreamHandler::class,
            'info.log',
            \FastD\Logger\Logger::INFO,
            \FastD\Logger\Formatter\StashFormatter::class,
        ],
    ],
    // code ...
];
```

日志会随着配置进行生成，结果如下:

```
{"@timestamp":"2017-09-12T15:47:37.189080+08:00","@version":1,"host":"10.1.81.60","message":"sprintf(): Too few arguments","type":"fast-d","channel":"fast-d","level":"ERROR","msg":"sprintf(): Too few arguments","code":0,"file":"/Users/janhuang/Documents/htdocs/me/fastd/fastd/vendor/fastd/routing/src/RouteDispatcher.php","line":78,"trace":["#0 [internal function]: FastD\\Application->FastD\\{closure}(2, 'sprintf(): Too ...', '/Users/janhuang...', 78, Array)","#1 /Users/janhuang/Documents/htdocs/me/fastd/fastd/vendor/fastd/routing/src/RouteDispatcher.php(78): sprintf('Middleware %s i...')","#2 /Users/janhuang/Documents/htdocs/me/fastd/fastd/vendor/fastd/routing/src/RouteDispatcher.php(60): FastD\\Routing\\RouteDispatcher->callMiddleware(Object(FastD\\Routing\\Route), Object(FastD\\Http\\ServerRequest))","#3 /Users/janhuang/Documents/htdocs/me/fastd/fastd/src/Application.php(142): FastD\\Routing\\RouteDispatcher->dispatch(Object(FastD\\Http\\ServerRequest))","#4 /Users/janhuang/Documents/htdocs/me/fastd/fastd/src/Application.php(205): FastD\\Application->handleRequest(Object(FastD\\Http\\ServerRequest))","#5 /Users/janhuang/Documents/htdocs/me/fastd/fastd/tests/app/web/index.php(15): FastD\\Application->run()","#6 {main}"]}
```

**忽略上述日志内容，程序看得懂即可**

配置 logstash 推送到 elasticsearch.

`config/logstash.conf`, 需要根据业务场景进行配置，现在显示最简单的配置。

```config
input {
    file {
        type => "fastd"
        path => ["log file path"]
    }
}

filter {
    json {
        source => "message"
    }
}

output {
    elasticsearch {
        action => "index"
        hosts => "127.0.0.1:9200"
        index => "fastd"
    }
}
```

配置无误后，开启日志采集

```
./bin/logstash -f path/to/logstash.conf
```

每当日志刷新新增的时候，agent 就会将日志采集推送到 elasticsearch. 如果觉得 ELK 会有卡顿或者性能问题，可能尝试结合 kafka 进行优化。

打开: `http://127.0.0.1:5601/`，即可看到刚才 php 应用产生的日志。



### 总结

如果 php 应用发生问题，异常而又无法第一时间发现的时候，日志可能是一个很好的切入点，当机器越来越多，应用越来越广泛的时候，日志可能会大量消耗人力，这个时候我们不得不去想办法，一方面解决人力问题，一方面需要提高应用质量。

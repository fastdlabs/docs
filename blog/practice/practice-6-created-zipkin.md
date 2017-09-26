zipkin是一个开放源代码分布式的跟踪系统，由Twitter公司开源，它致力于收集服务的定时数据，以解决微服务架构中的延迟问题，包括数据的收集、存储、查找和展现。它的理论模型来自于Google Dapper 论文。

#### 为什么要使用 zipkin

随着业务发展，系统拆分导致系统调用链路愈发复杂一个前端请求可能最终需要调用很多次后端服务才能完成，当整个请求变慢或不可用时，我们是无法得知该请求是由某个或某些后端服务引起的，这时就需要解决如何快读定位服务故障点，以对症下药。于是就有了分布式系统调用跟踪的诞生。而zipkin就是开源分布式系统调用跟踪的佼佼者

#### 安装 zipkin

```
wget -O zipkin.jar  'https://search.maven.org/remote_content?g=io.zipkin.java&a=zipkin-server&v=LATEST&c=exec'  

java -jar zipkin.jar
```

#### 安装 Molten

此处提供一个 C 扩展，为php提供对应的数据收集。地址: [点击我](https://github.com/chuan-yun/Molten)

安装参考: [molten安装](https://github.com/chuan-yun/Molten/blob/master/README_ZH.md)

添加到 php.ini

> 可以通过 php --ini 查看 php.ini 文件位置

```
extension=molten.so
molten.enable=1
molten.sink_type=4
molten.tracing_cli=1
molten.sink_http_uri=http://127.0.0.1:9411/api/v1/spans
molten.span_id_format=random
molten.sampling_rate=1
```

通过 `php -m | grep molten` 查看是否正确安装。

#### 结合 FastD PHP 框架

在 FastD(3.2版本新特性) 中，已经集成了相关调用链的基础类和配置，通过简单配置即可达到日志收集的效果。

调整配置文件: `app.php`

```php
<?php
return [
    //code ...
    'services' => [
        //code ...
        \FastD\ServiceProvider\MoltenServiceProvider::class,
    ],
    //code ...
];
```

在 `services` 选项中，追加: `\FastD\ServiceProvider\MoltenServiceProvider::class` 即可。

完成配置后，通过正常访问操作，查看效果.

![图片描述](https://sfault-image.b0.upaiyun.com/397/979/3979797788-59ba0b2f2460b_articlex)
日志:

![图片描述](https://sfault-image.b0.upaiyun.com/324/593/3245932138-59b7c152ac5b7_articlex)

## 总结

在应用上线后，我们需要急切并清楚明白应用的运行情况，调用情况，及请求响应情况，在第一时间去发现并解决问题。开发的工作往往是相对简单的，但是对于完整的体系和监控，那是相当的重要。

有了以上系统常规监控、日志集中分析、应用调用链监控，我们的业务就可以变得更加透明，清晰，可控。或许系统不足够完善，但是比起没有，那是要强得多。

相关文章:

[FastD 最佳实践四: 构建系统可视化监控](https://segmentfault.com/a/1190000011082379)
[FastD 最佳实践五: 构建ELK日志分析](https://segmentfault.com/a/1190000011136820)

# FastD PHP Simple Framework

FastD 是一个开源，面向对象的开发框架。其模式类似 Symfony 框架，良好的编码规范，灵活的开发模式，而且入门门槛不高，适合初中高不同阶段的开发者和乐于学习的 PHP 开发者。

感谢 Symfony、Laravel 这些优秀框架的出现，让本人可以通过参考和实践学习到好多额外的知识.

框架目的是解藕每个包之间的依赖关系及运行环境，框架本身依靠 `composer` 进行管理，框架本质，每个包都是一个可独立运行的小项目，每个包都可以凑合成一个整体的项目，但不互相依赖。

也正因为本人要去深造学习更多服务端方面的知识和技能，所以 **2.0** 这个版本是一个长期维护的版本，暂停新特性的开发，如果有好的想法和创意，会及时同步上去。

目前本人会去关注和研究: 

* 架构
* swoole

### ＃贡献

* [fastd](https://github.com/JanHuang/fastD)
* [fastd/bundlex](https://github.com/JanHuang/bundlex)
* [fastd/framework](https://github.com/JanHuang/framework)
* [fastd/container](https://github.com/JanHuang/container)
* [fastd/storage](https://github.com/JanHuang/storage)
* [fastd/http](https://github.com/JanHuang/http)
* [fastd/debug](https://github.com/JanHuang/debug)
* [fastd/database](https://github.com/JanHuang/database)
* [fastd/console](https://github.com/JanHuang/console)
* [fastd/annotation](https://github.com/JanHuang/annotation)
* [fastd/routing](https://github.com/JanHuang/routing)
* [fastd/config](https://github.com/JanHuang/config)
* [fastd/generator](https://github.com/JanHuang/generator)
* [fastd/swoole](https://github.com/JanHuang/swoole)
* [fastd/http-server-bundle](https://github.com/JanHuang/http-server-bundle)

如果对本项目有兴趣或者发现问题的，欢迎 fork 项目，然后提交修改或者问题，我会第一时间进行处理。

### ＃系统流程图

```
   +----------+           +-------------+                      +------------+                          
   |          |           |             |                      |            |                          
   |  Client  |---------->| Application |--------------------->|   Start    |                          
   |          |           |             |                      |            |                          
   +----------+           +-------------+                      +------------+                          
         ^                                                            |                                
         |                                                            |                                
         |                                                            v                                
         |                         +-------------+             +-------------+                         
         |                         |             |             |             |                         
         |                         |  Container  |------------>|  Bootstrap  |-----+                   
         |                         |             |             |             |     |                   
         |                         +-------------+             +-------------+     |                   
         |                                ^                                        |     +------------+
         |                        +-------+--------+                               |     |            |
         |                        |                |                               +---->|  Request   |
         |                  +-----------+    +-----------+                               |            |
         |                  |           |    |           |                               +------------+
         |                  |   Route   |    |  Service  |                                      |      
         |                  |           |    |           |                                      |      
+----------------+          +-----------+    +-----------+       +-------------+                |      
|                |                                               |             |                |      
|    Response    |                                               | Dispatcher  |                |      
|                |<----------------------------------------------|             |<---------------+      
|                |                                               |             |                       
+----------------+                                               +-------------+                       
                                                                        ^                              
                                                                        |                              
                                                                        +--------------+               
                                                                        |              |               
                                                                        |              v               
                                                                        |        +----------+          
                                                                        |        |          |          
                                                                        +--------|Controller|          
                                                                                 |          |          
                                                                                 +----------+          
```

### ＃环境要求

* PHP 7+

### License MIT

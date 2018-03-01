<h1 align="center">FastD</h1>

<p align="center">:rocket: A high performance PHP API framework.</p>

<p align="center">
<a href="https://travis-ci.org/fastdlabs/fastD"><img src="https://travis-ci.org/fastdlabs/fastD.svg?branch=master" /></a>
<a href="https://scrutinizer-ci.com/g/JanHuang/fastD/?branch=master"><img src="https://scrutinizer-ci.com/g/JanHuang/fastD/badges/quality-score.png?b=master" title="Scrutinizer Code Quality"></a>
<a href="https://scrutinizer-ci.com/g/JanHuang/fastD/?branch=master"><img src="https://scrutinizer-ci.com/g/JanHuang/fastD/badges/coverage.png?b=master" alt="Code Coverage"></a>
<a href="https://styleci.io/repos/35930132"><img src="https://styleci.io/repos/35930132/shield?branch=3.1" alt="StyleCI"></a>
<a href="https://fastdlabs.com/"><img src="https://poser.pugx.org/fastd/fastd/v/stable" /></a>
<a href="http://www.php.net/"><img src="https://img.shields.io/badge/php-%3E%3D5.6-8892BF.svg" /></a>
<a href="http://www.swoole.com/"><img src="https://img.shields.io/badge/swoole-%3E%3D1.9.6-8892BF.svg" /></a>
<a href="https://fastdlabs.com/"><img src="https://poser.pugx.org/fastd/fastd/license" /></a>
</p>

框架中集成了部分使用率较高的工具，提高开发效率，不必担心的是，框架并不会因为依赖的东西多了而造成速度的变慢，程序中，仅会对使用到的文件代码进行操作。

框架执行模式: 

1. 普通模式
2. 命令行模式
3. Swoole 模式

针对不同模式，加载的对象不大相同，所以针对不同的执行环境，会有不同的操作流程来加速框架的调度效率。

- 修改日志
    - [修改日志](zh-cn/change-log.md)
    - [升级指南](zh-cn/upgrade.md)

- 安装
    - [关于 FastD](zh-cn/introduct/1-1-about-fastd.md)
    - [安装 FastD](zh-cn/introduct/1-2-installing.md)
    - [目录结构](zh-cn/introduct/1-3-directory-structure.md)
    - [流程图](zh-cn/introduct/1-4-flow.md)
    - [生命周期](zh-cn/introduct/1-5-lifecycle.md)

- 基础入门
    - [配置](zh-cn/basic/2-1-configuration.md)
    - [路由与控制器](zh-cn/basic/2-2-routing-and-controllers.md)
    - [请求处理](zh-cn/basic/2-3-request-handling.md)
    - [响应处理](zh-cn/basic/2-4-response-handling.md)
    - [中间件](zh-cn/basic/2-5-middleware.md)
    - [认证授权](zh-cn/basic/2-6-authorization.md)
    - [异常与日志处理](zh-cn/basic/2-7-exception-logger-handling.md)
    

- 高级
    - [单元测试](zh-cn/advanced/3-1-testcase.md)
    - [辅助函数](zh-cn/advanced/3-2-helpers.md)
    - [服务提供器](zh-cn/advanced/3-3-service-provider.md)
    - [扩展](zh-cn/advanced/3-4-extend.md)
    - [日志分析](zh-cn/advanced/3-5-monitor.md)

- 数据库
    - [medoo](zh-cn/database/4-1-database.md)
    - [pool](zh-cn/database/4-2-connection-pool.md)
    - [ORM](zh-cn/database/4-3-orm.md)
    - [数据迁移](zh-cn/database/4-4-migration.md)

- 缓存
    - [缓存配置](zh-cn/cache/5-1-config.md)
    - [文件缓存](zh-cn/cache/5-2-file-cache.md)
    - [Redis缓存](zh-cn/cache/5-3-redis-cache.md)
    
- 命令行
    - [预设命令](zh-cn/console/6-1-console.md)
    - [自定义命令](zh-cn/console/6-2-custom.md)
    
- 进程
    - [进程管理](zh-cn/process/7-1-swoole-processor.md)
    
- Swoole
    - [基础使用](zh-cn/swoole/8-1-swoole-server.md)
    - [TCPServer](zh-cn/swoole/8-2-tcp-server.md)
    - [HttpServer](zh-cn/swoole/8-3-http-server.md)
    - [WebSocketServer](zh-cn/swoole/8-4-websocket-server.md)
    - [自定义服务器](zh-cn/swoole/8-5-custom-server.md)

- 最佳实践
    - [FastD 最佳实践一: 构建 API](http://blog.fastdlabs.com/2017-12-12/create-api)
    - [FastD 最佳实践二: 构建配置中心](http://blog.fastdlabs.com/2017-12-12/create-configure)
    - [FastD 最佳实践三: 构建API网关](http://blog.fastdlabs.com/2017-12-12/create-gatewray)
    - [FastD 最佳实践四: 构建系统可视化监控](http://blog.fastdlabs.com/2017-12-12/create-monitor)
    - [FastD 最佳实践五: 构建ELK日志分析系统](http://blog.fastdlabs.com/2017-12-12/create-log)
    - [FastD 最佳实践六: 为应用添加调用链监控 Zipkin](http://blog.fastdlabs.com/2017-12-12/create-zipkin)

- 周边
    * [FastD Viewer](https://github.com/JanHuang/viewer)
    * [FastD ORM](https://github.com/zqhong/fastd-eloquent)
    * [FastD QConf](https://github.com/JanHuang/QConfServiceProvider)
    * [FastD Seeder](https://github.com/RunnerLee/fastd-seeder)
    * [FastD Session](https://github.com/fastdlabs/session-provider)
    * [FastD HealthCheck](https://github.com/fastdlabs/health-check-provider)
    * [FastD Log](https://github.com/fastdlabs/log-provider)
    * [FastD Auth](https://github.com/fastdlabs/auth-provider)
    * [FastD Cache](https://github.com/fastdlabs/cache-provider)
    * [FastD CORS](https://github.com/fastdlabs/cors-provider)
    * [FastD i18n](https://github.com/fastdlabs/i18n-provider)
    * [FastD Mock](https://github.com/fastdlabs/mock-provider)
    * [FastD WeChat](https://github.com/fastdlabs/wechat-provider)
    * [Queue](https://github.com/RunnerLee/queue)
    * [Validator](https://github.com/RunnerLee/validator)

- 相关项目
    * [Dobee API Framework](https://github.com/JanHuang/dobee)

### Support

如果你在使用中遇到问题，请联系: [bboyjanhuang@gmail.com](mailto:bboyjanhuang@gmail.com). 微博: [编码侠](http://weibo.com/ecbboyjan)

## License MIT
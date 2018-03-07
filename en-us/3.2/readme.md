<h1 align = "center"> FastD </ h1>

<p align = "center">: rocket: A high performance PHP API framework. </ p>

<p align = "center">
<a href="https://travis-ci.org/fastdlabs/fastD"> <img src = "https://travis-ci.org/fastdlabs/fastD.svg?branch=master" /> </ a >
<a href="https://scrutinizer-ci.com/g/JanHuang/fastD/?branch=master"> <img src = "https://scrutinizer-ci.com/g/JanHuang/fastD/badges/ quality-score.png? b = master "title =" Scrutinizer Code Quality "> </a>
<a href="https://scrutinizer-ci.com/g/JanHuang/fastD/?branch=master"> <img src = "https://scrutinizer-ci.com/g/JanHuang/fastD/badges/ coverage.png? b = master "alt =" Code Coverage "> </a>
<a href="https://styleci.io/repos/35930132"> <img src = "https://styleci.io/repos/35930132/shield?branch=3.1" alt = "StyleCI"> </ a >
<a href="https://fastdlabs.com/"> <img src = "https://poser.pugx.org/fastd/fastd/v/stable" /> </a>
<a href="http://www.php.net/"> <img src = "https://img.shields.io/badge/php-%3E%3D5.6-8892BF.svg" /> < / a>
<a href="http://www.swoole.com/"> <img src = "https://img.shields.io/badge/swoole-%3E%3D1.9.6-8892BF.svg" /> < / a>
<a href="https://fastdlabs.com/"> <img src = "https://poser.pugx.org/fastd/fastd/license" /> </a>
</ p>

Framework integrates some of the more efficient use of tools to improve development efficiency, do not have to worry about the framework will not be dependent on more things caused by the slowdown in the process, only the use of the file code operating.

Framework execution mode:

Normal mode
Command line mode
Swoole mode

Targeted at different modes, loading objects are not the same, so for different execution environments, there will be different operational processes to speed up the scheduling efficiency of the framework.

- modify the log
    - [Change Log] (en-us / change-log.md)
    - [Upgrade Guide] (en-us / upgrade.md)

- Installation
    - [About FastD] (en-us / introduct / 1-1-about-fastd.md)
    - [Install FastD] (en-us / introduct / 1-2-installing.md)
    - [Directory Structure] (en-us / introduct / 1-3-directory-structure.md)
    - [Flowchart] (en-us / introduct / 1-4-flow.md)
    - [Life Cycle] (en-us / introduct / 1-5-lifecycle.md)

- basic entry
    - [Configuration] (en / basic / 2-1-configuration.md)
    - [Routing and Controllers] (en / basic / 2-2-routing-and-controllers.md)
    - [Request Processing] (zh-cn / basic / 2-3-request-handling.md)
    - [Response Processing] (zh-cn / basic / 2-4-response-handling.md)
    - [middleware] (en / basic / 2-5-middleware.md)
    - [Authentication] (zh-cn / basic / 2-6-authorization.md)
    - [Exceptions and Log Processing] (en / basic / 2-7-exception-logger-handling.md)
    

- Advanced
    - [Unit Test] (en-us / advanced / 3-1-testcase.md)
    - [Accessibility] (en-us / advanced / 3-2-helpers.md)
    - [Service Provider] (en-us / advanced / 3-3-service-provider.md)
    - [Extensions] (en-us / advanced / 3-4-extend.md)
    - [Log Analysis] (en-us / advanced / 3-5-monitor.md)

- Database
    - [medoo] (en-us / database / 4-1-database.md)
    - [pool] (en-us / database / 4-2-connection-pool.md)
    - [ORM] (en-us / database / 4-3-orm.md)
    - [Data Migration] (en-us / database / 4-4-migration.md)

- cache
    - [Cache Configuration] (en-us / cache / 5-1-config.md)
    - [file cache] (zh-cn / cache / 5-2-file-cache.md)
    - [Redis Cache] (en-us / cache / 5-3-redis-cache.md)
    
- Command Line
    - [Default Command] (en-us / console / 6-1-console.md)
    - [Custom Command] (en-us / console / 6-2-custom.md)
    
Process
    - [Process Management] (en-us / process / 7-1-swoole-processor.md)
    
- Swoole
    - [Basic Usage] (en-us / swoole / 8-1-swoole-server.md)
    - [TCPServer] (en-us / swoole / 8-2-tcp-server.md)
    - [HttpServer] (en-us / swoole / 8-3-http-server.md)
    - [WebSocketServer] (en-us / swoole / 8-4-websocket-server.md)
    - [Custom Server] (en-us / swoole / 8-5-custom-server.md)

- Best Practices
    - [FastD Best Practices: Building an API] (http://blog.fastdlabs.com/2017-12-12/create-api)
    - [FastD Best Practices 2: Building a Configuration Center] (http://blog.fastdlabs.com/2017-12-12/create-configure)
    - [FastD Best Practices Three: Build an API Gateway] (http://blog.fastdlabs.com/2017-12-12/create-gatewray)
    - [FastD Best Practices 4: Building System Visual Monitoring] (http://blog.fastdlabs.com/2017-12-12/create-monitor)
    - [FastD Best Practices 5: Building an ELK Log Analysis System] (http://blog.fastdlabs.com/2017-12-12/create-log)
    - [FastD Best Practices 6: Adding Call Chain Monitoring for Applications Zipkin] (http://blog.fastdlabs.com/2017-12-12/create-zipkin)

- around
    * [FastD Viewer] (https://github.com/JanHuang/viewer)
    * [FastD ORM] (https://github.com/zqhong/fastd-eloquent)
    * [FastD QConf] (https://github.com/JanHuang/QConfServiceProvider)
    * [FastD Seeder] (https://github.com/RunnerLee/fastd-seeder)
    * [FastD Session] (https://github.com/fastdlabs/session-provider)
    * [FastD HealthCheck] (https://github.com/fastdlabs/health-check-provider)
    * [FastD Log] (https://github.com/fastdlabs/log-provider)
    * [FastD Auth] (https://github.com/fastdlabs/auth-provider)
    * [FastD Cache] (https://github.com/fastdlabs/cache-provider)
    * [FastD CORS] (https://github.com/fastdlabs/cors-provider)
    * [FastD i18n] (https://github.com/fastdlabs/i18n-provider)
    * [FastD Mock] (https://github.com/fastdlabs/mock-provider)
    * [FastD WeChat] (https://github.com/fastdlabs/wechat-provider)
    * [Queue] (https://github.com/RunnerLee/queue)
    * [Validator] (https://github.com/RunnerLee/validator)

- related items
    * [Dobee API Framework] (https://github.com/JanHuang/dobee)

### Support

If you encounter problems in use, please contact: [bboyjanhuang@gmail.com] (mailto: bboyjanhuang@gmail.com). Weibo: [code Xia] (http://weibo.com/ecbboyjan)

## License MIT
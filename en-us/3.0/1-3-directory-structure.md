# 目录结构 

```
config
    app.php             应用默认配置
    config.php          用户自定义配置
    database.php        数据库配置
    routes.php          路由配置
    server.php          swoole 服务器配置
    cache.php           缓存配置
src
    Console             控制台命令
    Http                
        Controller      Http 控制器
    Middleware          Http 中间件
    ServiceProvider     自定义服务提供者
    Testing             单元测试
bin
    console
    server
web
    index.php
```

Source code is placed in the src directory, if the directory does not meet business needs, you can manually modify the way to adjust.

下一节: [routes and controller](zh-cn/3.0/2-1-routing-and-controllers.md)


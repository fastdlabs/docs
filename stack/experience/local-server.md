
# PHP 内置WebServer

PHP 5.4.0起， CLI SAPI 提供了一个内置的Web服务器。

这个内置的Web服务器主要用于本地开发使用，不可用于线上产品环境。

URI请求会被发送到PHP所在的的工作目录（Working Directory）进行处理，除非你使用了-t参数来自定义不同的目录。

如果请求未指定执行哪个PHP文件，则默认执行目录内的index.php 或者 index.html。如果这两个文件都不存在，服务器会返回404错误。

当你在命令行启动这个Web Server时，如果指定了一个PHP文件，则这个文件会作为一个“路由”脚本，意味着每次请求都会先执行这个脚本。如果这个脚本返回 FALSE ，那么直接返回请求的文件（例如请求静态文件不作任何处理）。否则会把输出返回到浏览器。

```shell
$ php -S localhost:8000 -t 指定目录

PHP 5.4.0 Development Server started at Thu Jul 21 10:43:28 2011
Listening on localhost:8000
Document root is /home/me/public_html
Press Ctrl-C to quit
```

然后访问指定目录的文件即可得到对应信息。

### 应用场景

在我们普通开发当中，我相信还有很多朋友都会使用 Apache 与 Nginx 去配置 web 服务器，当然这，并不会有什么问题。

在我的理解当中，可以更加简化开发环境的依赖和模式，我觉得这个应该的，并且，我觉得，技术的发展门槛应该需要越来越低。

所以我个人是比较推崇使用内置 Web 服务器进行开发调试。也就是 FastD 内推崇的模式。这样子，我们就不在需要依赖 Nginx 或者 Apache 来开发我们的应用了。

而且使用这种方式，可以更容易构建我们的开发环境，仅仅需要PHP，就可以完成我们日常开发所需。

![local-server](assets/local-server.gif)
# Helper function

Auxiliary functions currently do not provide custom templates, you can through the composer.json autoload custom extensions.

[PSR Specification Website] (http://www.php-fig.org/)

#### app (): Application

The function returns the application core, the application core inherits from the container, so the application itself is a container.

#### route ($ prefix = null, callable $ callback = null): \ FastD \ Routing \ RouteCollection

The routing function returns the route set directly when both $ prefix and $ callback are empty.

When you need to set up a routing group, you need to set $ prefix` and `$ callback` together, for example:

`` `php
route ("/", function () {
    route () -> get ("/ hello / {name}", "IndexController @ sayHello");
});
`` `

#### config (): \ FastD \ Config \ Config

Return to the configuration object, the specific operation can view: [Configuration] (https://github.com/JanHuang/config)

#### request (): \ Psr \ Http \ Message \ ServerRequestInterface

Return PSR7 ServerRequestInterface object, the specific operation can view: [HTTP] (https://github.com/JanHuang/http)

#### json (array $ content = [], $ statusCode = Response :: HTTP_OK, array $ headers = []): \ FastD \ Http \ JsonResponse

The return of the framework need to return the `Psr \ Http \ Message \ ResponseInterface` interface. In the function, [JsonResponse] (https://github.com/JanHuang/http/blob/master/src/JsonResponse.php) inherits [Response ] (https://github.com/JanHuang/http/blob/master/src/Response.php) and implement the related interface, so returning a response must return the implementation class `Psr \ Http \ Message \ ResponseInterface`.

#### logger (): \ Monolog \ Logger

Back to the monolog object, the framework provides two kinds of logs by default. One is the information log, the other is the error log, which is set in [Configuration] (). If you need to operate the log and create more logs, use this function to get the Logger object Operate.

More on monolog See: [Monolog] (https://github.com/Seldaek/monolog)

#### cache (): \ Symfony \ Component \ Cache \ Adapter \ AbstractAdapter

The cache provider relies on [Symfony / cache] (https://symfony.com/doc/current/components/cache.html), and the cache function returns an AbstractAdapter object that can be viewed for specific operations. If you can not meet your business needs, you can customize the service provider to replace it.

#### database (): \ medoo

The default DatabaseServiceProvider is provided medoo operation, does not provide specific ORM and other related operations, if you need to customize the database operations, you can achieve by extending their own ServiceProvider.

The specific operation and use, please see: [service provider] (zh-cn / 3.0 / 3-6-service-provider.md)

Next Section: [Service Providers] (en-us / 3.0 / 3-8-service-provider.md)
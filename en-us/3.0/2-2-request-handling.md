# Request processing

Http request processing comes from [Http] (https://github.com/JanHuang/http) components, which provide powerful Http parsing preprocessing, support for Swoole.

When a user initiates a Http request, the Http component encapsulates the request into a ServerRequestInterface implementation class, implements the PSR7 standard, and passes the object to the controller.

> Since Http parsing is done through parse_url, you need to configure your virtual-host to access otherwise the route 404 not found

`` `php
namespace Http \ Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
     public function sayHello (ServerRequest $ serverRequest)
     {
         return json ($ serverRequest-> getQueryParams ());
     }
}
`` `

Since Http components implement PSR7, the usage is to keep PSR7 consistent, and operations can be viewed according to [Http] (https://github.com/JanHuang/http)

Next Section: [Response Processing] (en-us / 3.0 / 2-3-response-handling.md)
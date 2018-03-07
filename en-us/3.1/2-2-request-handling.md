# Request processing

FastD default built-in HTTP, TCP, UDP, WebSocket protocol, powered by [Swoole] (http://www.swoole.com/).

### HTTP

Http request processing comes from [Http] (https://github.com/JanHuang/http) components, which provide powerful Http parsing preprocessing, support for Swoole.

When a user initiates a Http request, the [Http] (https://github.com/JanHuang/http) component encapsulates the request into a ServerRequestInterface implementation class, implementing [PSR7] (http: //www.php-fig .org / psr / psr-7 /) standard and pass the object to the controller.

> Since Http parsing is done through parse_url, you need to configure your virtual-host to access otherwise the route 404 not found

`` `php
<? php

namespace Controller;


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

If you need to interrupt the execution of logic processing, you can use the `abort` function to operate.

`` `php
<? php

namespace Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
    public function sayHello (ServerRequest $ serverRequest)
    {
        if (! empty ($ serverRequest-> getQueryParams ())) {
            abort (400);
        }
        return json ($ serverRequest-> getQueryParams ());
    }
}
`` `

### TCP

The TCP resolution protocol is `JSON`, so the parameters need to be json-encoded when passing parameters. The upcoming expansion is custom protocol encapsulation.

The built-in default data format is:

`` `json
{
  "method": "get",
  "path": "/",
  "args": {
    "foo": "bar"
  }
}
`` `

### WebSocket

WebSocket also uses JSON as the data transfer format, keeping the same format as the TCP parameters.

Detailed server configuration can be clicked on: [Swoole server] (zh-cn / 3.1 / 3-9-swoole-server.md)

Built-in server protocol will eventually be converted to HTTP protocol resolution, so it can be compatible with a variety of built-in server, smooth transition.

Next Section: [Response Processing] (en-us / 3.1 / 2-3-response-handling.md)
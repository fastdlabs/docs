# Middleware

Routing is one of the core functions of the entire framework, and the final execution of the final callback operation according to the routing address operation, and the callback processing itself is a middleware processing module.

When the controller is configured middleware, the implementation of all the middleware will be deployed all the first call, the final landing in the controller method, the final handling by the developer.

### middleware configuration

The steps are only three steps:

1. New middleware
2. Registration of middleware to the configuration file
Add the middle to the router

`` `php
<? php

return [
    // some code ...
    / **
     * Http middleware
     * /
    'middleware' => [
        'foo' => Bar :: class,
    ],
];
`` `

Added to the route

`` `php
route () -> post ('/', 'IndexController @ sayHello') -> withMiddleware ('basic.auth');
`` `

### Custom middleware

To achieve their own middleware, only a small part of the code needed to be able to complete a simple middleware processing.

`` `php
<? php

namespace FastD \ Auth;

use FastD \ Middleware \ DelegateInterface;
use FastD \ Middleware \ Middleware;
use Psr \ Http \ Message \ ResponseInterface;
use Psr \ Http \ Message \ ServerRequestInterface;
use FastD \ Http \ Response;

class BasicAuth extends Middleware
{
    / **
     * @param ServerRequestInterface $ serverRequest
     * @param DelegateInterface $ delegate
     @return ResponseInterface
     * /
    public function handle (ServerRequestInterface $ serverRequest, DelegateInterface $ delegate)
    {
        if (/ * logic * / true) {
            $ delegate-> process ($ serverRequest);
        }
        
        return new Response ('hello');
    }
}
`` `

Middleware scheduling, it is recommended to return `Psr \ Http \ Message \ ResponseInterface`, each middleware must follow the rules.

Implementation principle can refer to: [PSR15] (https://github.com/php-fig/fig-standards/blob/master/proposed/http-middleware)

Next section: [Authorization] (en / basic / 2-6-authorization.md)
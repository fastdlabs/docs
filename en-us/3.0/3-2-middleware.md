# Middleware

The principle of middleware is actually a multi-layer nested anonymous function, starting from the beginning of the call function, down until the back has no callback, returned to the client.

The middleware inside is the same principle. When the middleware is processed, it finally arrives at the callback in the routing. The middleware depends on the [middleware] (https://github.com/JanHuang/middleware) component and supports PSR15.

The middleware is recommended to be stored in the `src / Middleware` directory. Each middleware must inherit the` FastD \ Middleware \ Middleware` object and implement the `handle` method.

`` `php
namespace FastD \ Auth;

use FastD \ Middleware \ DelegateInterface;
use FastD \ Middleware \ Middleware;
use Psr \ Http \ Message \ ResponseInterface;
use Psr \ Http \ Message \ ServerRequestInterface;

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
            $ delegate ($ serverRequest);
        }
        
        return 'hello';
    }
}
`` `

Middleware, if the returned result is a string, it will be converted into `Psr \ Http \ Message \ ResponseInterface` object by default, which is encapsulated by the middleware scheduler.

So if you want to return different formats in the middleware, you must return a `Psr \ Http \ Message \ ResponseInterface` object that you can customize.

Next Section: [Command Line] (en-us / 3.0 / 3-3-database.md)
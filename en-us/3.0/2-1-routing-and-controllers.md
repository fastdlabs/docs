# Routing and Controller

Routing comes from the [routing] (https://github.com/JanHuang/routing) component, which provides high-performance routing configuration and resolution processing and well supported RESTful.

The routing configuration files are stored in the `config/routes.php` file.

### Routing configuration

In routing callback processing, the controller does not need to write a namespace, and by default appends the `Http \ Controoler` namespace before the controller.

##### Method Routing:
 
`` `php
route () -> get ('/', 'IndexController @ sayHello');
`` `

`` `php
route () -> post ('/', 'IndexController @ sayHello');
`` `

Support `get, post, put, head, delete` method

##### routing group

`` `php
route () -> group ('/ v1', function () {
    route () -> get ('/', 'IndexController @ sayHello');
});
`` `

The above routing will callback processing when the user accesses `/ v1 /` or `/ v1`

##### Routing fuzzy matching

`` `php
route () -> get ("/ foo/*", "IndexController @ sayHello");
`` `

This mode will match the address `[\/_ a-zA-Z0-9 -] +` at the beginning of/foo to the controller and get the matched address with `fuzzy_path`.

`` `php
$ request-> getAttribute ('fuzzy_path');
`` `

### controller

Routing configuration does not support anonymous function callback, so the shield in the core processing of this feature, users keep the configuration file clean and independent, it is recommended that developers use the controller callback approach.

** The controller is currently stored in the Http directory, version 3.1 will be unified controller entrance, while providing services for TCP, HTTP, remove the Http directory, keep the Controller directory, the other structures are not changed **

> The controller does not need to inherit any object, and the methods are provided by [Accessibility] (en-us/3.0/3-5-helpers.md)

`` `php
namespace Http \ Controller;


class IndexController
{
    public function sayHello ()
    {
        return json ([
            'foo' => 'bar'
        ]);
    }
}
`` `

It is not hard to see that a careful friend can easily find that the controller here is actually a "middleware" callback. If there is a logic handling error in [middleware] (zh-cn/3.0/3-2-middleware.md), it is Will not enter the controller.

Middleware implementation relies on [Middleware] (https://github.com/JanHuang/middleware) components.

If the route is dynamic routing, the parameters need to be accessed through the `ServerRequestInterface` object.

`` `php
route () -> get ('/ hello/{name}', 'IndexController @ sayHello');
`` `

`` `php
namespace Http \ Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
    public function sayHello (ServerRequest $ request)
    {
        return json ([
            'name' => $ request-> getAttribute ('name')
        ]);
    }
}
`` `

And so on.

Next section: [Request] (en-us/3.0/2-2-request-handling.md)
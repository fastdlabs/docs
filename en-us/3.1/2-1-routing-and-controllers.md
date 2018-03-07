# Routing and Controller

Routing comes from the [routing] (https://github.com/JanHuang/routing) component, which provides high-performance routing configuration and resolution processing, good RESTful support, and support for fuzzy matching.

### Routing configuration

In routing callback processing, the controller does not need to write a namespace, the default controller before appending the `Controller` namespace.

> Version 3.1 controllers have been migrated to the Controller directory, version 3.0 is stored in the `Http / Controller` directory

#### method of routing
 
`` `php
route () -> get ('/', 'IndexController @ sayHello');
`` `

`` `php
route () -> post ('/', 'IndexController @ sayHello');
`` `

Support `get, post, put, head, delete` method. Adding a routing name makes it easier to call in [TCPServer] (en-us / 3.1 / 3-9-swoole-server.md)

#### routing group

`` `php
route () -> group ('/ v1', function () {
    route () -> get ('/', 'IndexController @ sayHello');
});
`` `

The above routing will callback processing when the user accesses `/ v1 /` or `/ v1`.

#### fuzzy match

`` `php
route () -> get ("/ foo / *", "IndexController @ sayHello");
`` `

This mode will match the address `[\ / _ a-zA-Z0-9 -] +` at the beginning of / foo to the controller and get the matched address with `fuzzy_path`.

`` `php
$ request-> getAttribute ('fuzzy_path');
`` `

### middleware

Routing is one of the core functions of the entire framework, and the final execution of the final callback operation according to the routing address operation, and the callback processing itself is a middleware processing module.

Before using the middleware, you need to configure the list of available middleware, through `config / app.php` configuration file configuration

`` `php
<? php

return [
    // some code ...
    / **
     * Http middleware
     * /
    'middleware' => [
        'basic.auth' => new FastD \ BasicAuthenticate \ HttpBasicAuthentication ([
            'authenticator' => [
                'class' => \ FastD \ BasicAuthenticate \ PhpAuthenticator :: class,
                'params' => [
                    'foo' => 'bar'
                ]
            ],
            'response' => [
                'class' => \ FastD \ Http \ JsonResponse :: class,
                'data' => [
                    'msg' => 'not allow access',
                    'code' => 401
                ]
            ]
        ])
    ],
];
`` `

Key name `basic.auth` is the name of the middleware, you can pass

`` `php
route () -> post ('/', 'IndexController @ sayHello') -> withMiddleware ('basic.auth');
`` `

Configure. Whenever the program calls `/` address, it will be configured middleware.

##### Routing Group Middleware

`` `php
route () -> group (['prefix' => '/ v1', 'middleware' => 'demo'], function () {
    route () -> get ('/', 'IndexController @ sayHello');
});
`` `

Routing group to support the overall set of middleware, sub-routing can be unified set the middle. By default, intermediate routes in a routing group are inherited in a sub-route. If you continue to define middleware in a routing group, the route continues to be added to the specified route.

### controller

Routing configuration does not support anonymous function callback, so the shield in the core processing of this feature, users keep the configuration file clean and independent, it is recommended that developers use the controller callback approach.

** The controller is currently stored in the Http directory, version 3.1 will be unified controller entrance, while providing services for TCP, HTTP, remove the Http directory, keep the Controller directory, the other structures are not changed **

> The controller does not need to inherit any object, and the methods are provided by [helper functions] (en-us / 3.1 / 3-7-helpers.md)

`` `php
namespace Controller;


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

As mentioned above, the controller here is a "middleware" callback process that does not go into the controller if it is handled logically in [middleware] (3-2-middleware.md).

Middleware implementation relies on [Middleware] (https://github.com/JanHuang/middleware) components.

If the route is dynamic routing, the parameters need to be accessed through the `ServerRequestInterface` object.

##### example

** config / routes.php **

`` `php
route () -> get ('/ hello / {name}', 'IndexController @ sayHello');
`` `

** Controller \ IndexController **

`` `php
namespace Controller;


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

Next Section: [Request] (en-us / 3.1 / 2-2-request-handling.md)
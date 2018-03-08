# Routing and Controller

Routing comes from the [routing](https://github.com/JanHuang/routing) component, which provides high-performance routing configuration and resolution processing, good RESTful support, and support for fuzzy matching.

### Routing configuration

In routing callback processing, the controller does not need to write a namespace, the default controller before appending the `Controller` namespace.

!> From version 3.1, the controller has been migrated to the `Controller` directory, version 3.0 stored in the `Http/Controller` directory

#### method of routing
 
```php
route()->get('/', 'IndexController@sayHello');
route()->post('/', 'IndexController@sayHello');
```

Support `get, post, put, head, delete` method. Adding routing names makes it easier to call in [TCPServer](en-us3.2/swoole/8-1-swoole-server.md)

#### routing group

```php
route()->group('/v1', function () {
    route()->get('/', 'IndexController@sayHello');
});
```

The above routing will callback processing when the user accesses `/ v1 /` or `/ v1`.

#### fuzzy match

```php
route()->get("/foo/*", "IndexController@sayHello");
```

This mode will match the address `[\/_a-zA-Z0-9-]+` at the beginning of / foo to the controller and get the matched address with `fuzzy_path`.

```php
$request->getAttribute('fuzzy_path');
```

Routing group to support the overall set of middleware, sub-routing can be unified set the middle. By default, intermediate routes in a routing group are inherited in a sub-route. If you continue to define middleware in a routing group, the route continues to be added to the specified route.

### controller

Routing configuration does not support anonymous function callback, so the shield in the core processing of this feature, users keep the configuration file clean and independent, it is recommended that developers use the controller callback approach.

!> The controller is currently stored in the Http directory, version 3.1 will be unified controller entrance, while providing services for TCP, HTTP, remove the Http directory, keep the Controller directory, the other structure unchanged

> The controller does not need to inherit any object, and the methods are provided by [Accessory](en-us/3.2/advanced/3-2-helpers.md)

#### normal response

Corresponding routing controller method must return a `Response` object, or can not send data to the client.

The built-in `json` function is used to encapsulate the output data in` json` format, using the following:

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        return json([
            'name' => $request->getAttribute('name')
        ]);
    }
}
```

The controller (middleware) method receives by default: the `ServerRequest` object, the` ServerRequest` object from the http component, and the inner encapsulation to the http protocol.

#### Abnormal interrupt

Framework provides interrupt handling for the application exception occurs, prompt the client for processing.

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        abort(400, 'foo bar');
    }
}
```

Corresponding client receives the following format:

`` `json
{
    "code": 400,
    "msg": "foo bar"
}
`` `

Next Section: [Request](en-us/3.2/basic/2-3-request-handling.md)
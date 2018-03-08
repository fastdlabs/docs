# Create API

Creating an API requires only two steps:

1. Create a controller: mainly used for routing callback, when the route is successfully accessed, will be processed layer by layer until it is scheduled to a custom controller
2. Create a route: Add access to the controller entrance, such as the need to provide external access, you must set the corresponding routing method.

## Creating Controllers and Routes

Suppose you want to create a `/hello/{name}` to generate the name and print it out. To do this, create a Controller class and Controller method in it:

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class HelloController
{
    /**
     * @param ServerRequest $request
     * @return \FastD\Http\Response
     */
    public function hello (ServerRequest $request)
    {
        return json ([
            'msg' => 'hello '.$request->getAttribute('name')
        ]);
    }
}
```

Now you need to associate controllers and methods with the route so that users can access it normally. This association is configured via the `config / routes.php` file.

```php
<?php

$router = route();

$router->get('/hello/{name}', 'HelloController@hello');
```

Now you can try to access it:

> http://localhost:9876/hello/jan

## Creating Middleware

Another feature of the fastd framework is that all logic is handled and the controller is a middleware. To do this, first attach a diagram:

![](https://www.slimframework.com/docs/images/middleware.png)

The whole application wanted an onion, peeled off layer by layer, and knew the innermost "heart (controller)". At this point, the entire call was completed.

After understanding the above principle, then let's begin to do the first middleware.

Suppose I want to make a judgment on `/hello/{name}`. If it is jan, the user will show ** handsome **, `runnerlee` will show` okay`. To do this, we only need to add a simple judgment to the middle:

```php
<?php

namespace Middleware;


use FastD\Middleware\DelegateInterface;
use FastD\Middleware\Middleware;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class ManMiddleware extends Middleware
{
    /**
     * @param ServerRequestInterface $request
     * @param DelegateInterface $next
     * @return ResponseInterface
     */
    public function handle(ServerRequestInterface $request, DelegateInterface $next)
    {
        $man = $request->getAttribute('name');
        if ('jan' === $man) {
            $request->withAttribute('name', 'handsome'.$man);
        } else if ('runnerlee' === $man) {
            $request->withAttribute('name', 'OK'.$man);
        }

        return $next->process($request);
    }
}
```

Now add the middleware to the application configuration (`config/app.php`):

```php
<?php
return [
    /**
     * Http middleware
     */
    'middleware' => [
        'man' => [
            \Middleware\ManMiddleware::class
        ]
    ],
];
```

Finally, add middleware to the route:

!> The middleware added by route needs to be consistent with the middleware configuration key configured by the application.

```php
<?php

$router = route ();

$router->get('/hello/{name}', 'HelloController@hello')->withAddMiddleware('man');
```

Try to visit separately:

http://localhost:9876/hello/runnerlee

```json
{
    "msg": "hello ok runnerlee"
}
```

http://localhost:9876/hello/jan

```json
{
    "msg": "hello handsome jan"
}
```

Operation to understand? In fact, after understanding the principle of operation, the rest will be solved, is not it a little sense to start it? Next may have a different experience Oh. 😎
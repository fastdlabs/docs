# Response processing

Each route corresponds to the controller method, and the method needs to return the corresponding response information to complete a complete request response.

#### Responder

Using the `json` function provided by the framework, it is possible to quickly output` json` data to the client.

`` `php
<? php

namespace Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
    public function sayHello (ServerRequest $ request)
    {
        return json ([
            'foo' => 'bar'
        ]);
    }
}
`` `

If you need to respond to a special http status code, you can adjust it with the second parameter.

`` `php
<? php

namespace Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
    public function sayHello (ServerRequest $ request)
    {
        return json ([
            'foo' => 'bar'
        ], 201);
    }
}
`` `

#### Response headers

When you need to customize some response headers, you can use the PSR7 Response object method to set the response headers.

`` `php
<? php

namespace Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
    public function sayHello (ServerRequest $ request)
    {
        return json ([
            'args' => $ request-> getParsedBody ()
        ]) -> withHeader ('foo', 'bar');
    }
}
`` `

##### Set cookies

The use of response headers, set cookie information, the realization of the framework of the cookie is also implemented using the `header` function.

`` `php
<? php

namespace Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
    public function sayHello (ServerRequest $ request)
    {
        return json ([
            'args' => $ request-> getParsedBody ()
        ]) -> withCookie ('foo', 'bar');
    }
}
`` `

##### Set the cache-control

Response object also provides a common http cache configuration.

`` `php
<? php

namespace Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
    public function sayHello (ServerRequest $ request)
    {
        return json ([
            'args' => $ request-> getParsedBody ()
        ]) -> withCacheControl ('public')
        -> withExpires (new \ DateTime ('2017-10-11'));
    }
}
`` `

#### text / html format

Because the framework is targeted at API development, the default data format provided by the framework is: json. So by a small part of the scene is actually no need to use json, then you need to directly through the Response content to customize the output.

`` `php
<? php

namespace Controller;

use FastD \ Http \ Response;
use FastD \ Http \ ServerRequest;

class IndexController
{
    public function sayHello (ServerRequest $ request)
    {
        return new Response ('hello world');
    }
}
`` `

Next: [middleware] (en / basic / 2-5-middleware.md)
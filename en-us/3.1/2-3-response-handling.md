# Response processing

The API returns are both `json` because, primarily for the API scenario alone, the business purpose can be achieved by customizing [Extensions] (zh-cn / 3.1 / 3-8-extend.md) if the feature does not meet the business needs, But you must return the `Psr \ Http \ Message \ ResponseInterface` abstract interface class.

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

json is a helper provided by the framework that can be consulted by `helpers.php`.

After the response object is returned to the Application, the Application will automatically wrap the Response, output Header, Body, and if it is a TCP service, will output a specific Body.

If you want to customize the output format, you need to implement your own server. The specific implementation can refer to the built-in server: [HTTP] (../../ src / Servitization / Server / HTTPServer.php), [TCP] (../../ src / Servitization / Server / TCPServer.php)

The server is based on the Swoole extension implementation, which can be reached at: [Swoole Server] (en-us / 3.1 / 3-9-swoole-server.md)

Next Section: [Authorization] (en-us / 3.1 / 2-4-authorization.md)
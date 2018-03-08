# HTTP Server

Framework provides HTTP Server, unless there are special needs, otherwise able to meet most of the daily operation, and PHP built-in web server the same operation.

Setting HTTPServer only needs to adjust the `class` option. as follows:

```php
<?php
return [
    'host' => 'http://0.0.0.0:9527',
    'class' => \FastD\Servitization\Server\HTTPServer::class,
    'options' => [
        'pid_file' => __DIR__.'/../runtime/pid/'.app()->getName().'.pid',
        'worker_num' => 10,
        'task_worker_num' => 20,
    ],
    'processes' => [
    ],
    'listeners' => [
    ],
];
```

Start the service through the server command:

```php
$ php bin/server start
```

Core implementation logic code:

```php
<?php

namespace FastD\Servitization\Server;

use FastD\Http\Response;
use FastD\Http\SwooleServerRequest;
use FastD\Servitization\OnWorkerStart;
use FastD\Swoole\Server\HTTP;
use Psr\Http\Message\ServerRequestInterface;
use swoole_http_request;
use swoole_http_response;

class HTTPServer extends HTTP
{
    use OnWorkerStart;

    public function onRequest(swoole_http_request $swooleRequet, swoole_http_response $swooleResponse)
    {
        $request = SwooleServerRequest::createServerRequestFromSwoole($swooleRequet);

        $response = $this->doRequest($request);
        foreach ($response->getHeaders() as $key => $header) {
            $swooleResponse->header($key, $response->getHeaderLine($key));
        }
        foreach ($response->getCookieParams() as $key => $cookieParam) {
            $swooleResponse->cookie($key, $cookieParam);
        }

        $swooleResponse->status($response->getStatusCode());
        $swooleResponse->end((string) $response->getBody());
        app()->shutdown($request, $response);
    }

    public function doRequest(ServerRequestInterface $serverRequest)
    {
        return app()->handleRequest($serverRequest);
    }
}

```

When the server receives the request, it will first call the `onRequest` method, in` onRequest`, the processing logic is the same as fpm.
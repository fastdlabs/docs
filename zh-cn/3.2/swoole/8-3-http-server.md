# HTTP Server

框架提供 HTTP Server，除非有特殊需求，否则能够满足日常大部分操作，与 PHP 内置web服务器同样操作。

设置 HTTPServer 仅需要对 `class` 选项进行调整即可。如下:

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

通过服务器命令启动服务:

```php
$ php bin/server start
```

核心实现逻辑代码:

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

当服务器收到请求的时候，会首先调用 `onRequest` 方法，在 `onRequest` 中，处理逻辑与fpm下一致.
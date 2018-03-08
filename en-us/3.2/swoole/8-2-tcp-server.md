# TCP Server

The framework provides the original TCPServer provided by `\FastD\Servitization\Server\TCPServer`. Implementation code is as follows:

```php
<?php

namespace FastD\Servitization\Server;

use FastD\Http\ServerRequest;
use FastD\Packet\Json;
use FastD\Servitization\OnWorkerStart;
use FastD\Swoole\Server\TCP;
use swoole_server;

class TCPServer extends TCP
{
    use OnWorkerStart;

    public function doWork(swoole_server $server, $fd, $data, $from_id)
    {
        if ('quit' === $data) {
            $server->close($fd);

            return 0;
        }
        $data = Json::decode($data);
        $request = new ServerRequest($data['method'], $data['path']);
        if (isset($data['args'])) {
            if ('GET' === $request->getMethod()) {
                $request->withQueryParams($data['args']);
            } else {
                $request->withParsedBody($data['args']);
            }
        }
        $response = app()->handleRequest($request);
        $server->send($fd, (string) $response->getBody());
        app()->shutdown($request, $response);

        return 0;
    }
}
```

The main core accepts json format data and is handled by the `FastD\Packet\Json` object. Therefore, TCPServer accept the need to accept the data in `json` format, for example:

```json
{
    "path": "/",
    "args": []
}
```
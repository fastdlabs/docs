# TCP Server

框架提供原始的 TCPServer, 由 `\FastD\Servitization\Server\TCPServer` 提供。实现代码如下:

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

主要核心接受 `json` 格式数据，由 `FastD\Packet\Json` 对象进行处理。因此 TCPServer 接受需要接受 `json` 格式的数据，例如:

```json
{
    "path": "/",
    "args": []
}
```



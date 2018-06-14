# WebSocket Server
# WebSocket Server
1.框架提供原始的 FastD\Servitization\Server，实现代码如下：

```
<?php

class WebSocketServer extends WebSocket
{
    use OnWorkerStart;

    /**
     * @param swoole_server          $server
     * @param swoole_websocket_frame $frame
     *
     * @return int|mixed
     *
     * @throws \Exception
     * @throws \FastD\Packet\Exceptions\PacketException
     */
    public function doMessage(swoole_server $server, swoole_websocket_frame $frame)
    {
        $data = $frame->data;
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
        $fd = null !== ($fd = $response->getFileDescriptor()) ? $fd : $frame->fd;
        if (false === $server->connection_info($fd)) {
            return -1;
        }
        $server->push($fd, (string) $response->getBody());
        app()->shutdown($request, $response);

        return 0;
    }
}

配置文件 
return [
    'host' => 'ws://127.0.0.1:9527',
    'class' => \FastD\Servitization\Server\WebSocketServer::class,
    'options' => [
        'pid_file' => __DIR__.'/../runtime/pid/'.app()->getName().'.pid',
        'log_file' => __DIR__.'/../runtime/logs/'.date('Ymd').'/'.app()->getName().'.log',
        'worker_num' => 8,
        'task_worker_num' => 8,
        'user' => 'www',
        'group' => 'www',
    ],
];

```

主要核心接受 json 格式数据，由 FastD\Packet\Json 对象进行处理。因此 TCPServer 接受需要接受 json 格式的数据，例如:

```
{
    "method":"POST",
    "path": "/",
    "args": [
      "foo":"bar"
    ]
}

```
客户端示例代码：
```
var ws = new WebSocket("ws://127.0.0.1:9527"); 
ws.onopen = function(evt) {  
    console.log("Connection open ...");  
    var data = {
      "method":"POST",
      "path":"/",
      "args":{
        "foo":"bar"
      }
    };
    data = JSON.stringify(data);
    ws.send(data);  
};  
ws.onmessage = function(evt) {  
    console.log("Received Message: " + evt.data);  
    ws.close();  
};  
ws.onclose = function(evt) {  
    console.log("Connection closed.");  
};  
```
如上示例会被分发到POST路由 "/" 下，参数foo值为bar

#2.如果你想自定义WebSocket 只需要修改配置为
```
return [
    'host' => 'ws://127.0.0.1:9527',
    'class' => \Server\CustomizeSocketServer::class,
    'options' => [
        'pid_file' => __DIR__.'/../runtime/pid/'.app()->getName().'.pid',
        'log_file' => __DIR__.'/../runtime/logs/'.date('Ymd').'/'.app()->getName().'.log',
        'worker_num' => 8,
        'task_worker_num' => 8,
        'user' => 'www',
        'group' => 'www',
    ],
];
```
并增加目录和文件：项目目录/app/src/Server/CustomizeSocketServer.php 大致内容如下：
```
<?php

namespace Server;

use FastD\Servitization\OnWorkerStart;
use FastD\Swoole\Server\WebSocket;
use swoole_server;
use swoole_websocket_frame;

/**
 * Class WebSocketServer.
 */
class CustomizeSocketServer extends WebSocket
{
    use OnWorkerStart;

    /**
     * @param swoole_server          $server
     * @param swoole_websocket_frame $frame
     *
     * @return int|mixed
     *
     * @throws \Exception
     * @throws \FastD\Packet\Exceptions\PacketException
     */
    public function doMessage(swoole_server $server, swoole_websocket_frame $frame)
    {   
        //接收客户端的数据 $frame-data
        //客户链接标识： $frame->fd
        //在这里实现你的代码逻辑
        //如想直接响应客户端(如果响应的数据为二进制数据需要增加第三个参数为 WEBSOCKET_OPCODE_BINARY )
        $server->push($frame->fd, "hello!");
    }

    public function doClose(swoole_server $server, $fd, $fromId){
        //客户端断开事件
    }

    //还有其他事件请看 WebSocket 类
}

```
启动服务 :cd到项目目录执行 php bin/server start 如需挂为守护进程增加 -d 参数

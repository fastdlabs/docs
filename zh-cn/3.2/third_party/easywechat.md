# EasyWechat 整合

相信大家都有很多使用微信的场景，3.2 版本开始，已经兼容 easywechat 开发套件，可以无缝整合到 fastd 中，非常滴好用。

EasyWechat 官网: [点我](https://www.easywechat.com/docs/master)

```php
<?php

use EasyWeChat\Factory;

$config = [
    'app_id' => 'wx3cf0f39249eb0exx',
    'secret' => 'f1c242f4f28f735d4687abb469072axx',

    // 指定 API 调用返回结果的类型：array(default)/collection/object/raw/自定义类名
    'response_type' => 'array',

    'log' => [
        'level' => 'debug',
        'file' => __DIR__.'/wechat.log',
    ],
];

$app = Factory::officialAccount($config);

$app->server->push(function ($message) {
    // $message['FromUserName'] // 用户的 openid
    // $message['MsgType'] // 消息类型：event, text....
    return "您好！欢迎使用 EasyWeChat";
});

// 在 laravel 中：
$response = $app->server->serve();

// $response 为 `Symfony\Component\HttpFoundation\Response` 实例
// 对于需要直接输出响应的框架，或者原生 PHP 环境下
$response->send();

// 而 fastd 中直接返回即可：

return $response;
```

其他操作仅需要根据easywechat进行处理即可。



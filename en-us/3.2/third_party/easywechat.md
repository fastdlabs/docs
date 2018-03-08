# EasyWechat integration

I believe we all have a lot of scenes using WeChat, 3.2 version of the beginning, has been compatible with easywechat development kit, can be seamlessly integrated into fastd, very good for drop.

EasyWechat official website: [click me](https://www.easywechat.com/docs/master)

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
    return "Hello EasyWeChat";
});


$response = $app->server->serve();

$response->send();

// in laravel or fastd

return $response;
```

Other operations need only be handled according to easywechat.
# EasyWechat integration

I believe we all have a lot of scenes using WeChat, 3.2 version of the beginning, has been compatible with easywechat development kit, can be seamlessly integrated into fastd, very good for drop.

EasyWechat official website: [click me] (https://www.easywechat.com/docs/master)

`` `php
<? php

use EasyWeChat \ Factory;

$ config = [
    'app_id' => 'wx3cf0f39249eb0exx',
    'secret' => 'f1c242f4f28f735d4687abb469072axx',

    // specifies the type of result returned by the API call: array (default) / collection / object / raw / custom class name
    'response_type' => 'array',

    'log' => [
        'level' => 'debug',
        'file' => __DIR __. '/ wechat.log',
    ],
];

$ app = Factory :: officialAccount ($ config);

$ app-> server-> push (function ($ message) {
    // $ message ['FromUserName'] // The user's openid
    // $ message ['MsgType'] // Message Type: event, text ....
    return "Hello! Welcome to EasyWeChat";
});

// in laravel:
$ response = $ app-> server-> serve ();

// $ response for the `Symfony \ Component \ HttpFoundation \ Response` instance
// For frameworks that require a direct output response, or native PHP environment
$ response-> send ();

// FastD can be returned directly:

return $ response;
`` `

Other operations need only be handled according to easywechat.
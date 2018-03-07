# Abnormal and log processing

Framework provides basic error handling, you can centrally handle a variety of exceptions. Logs are stored in `runtime / logs` and can be sent centrally to a log server via business requirements. FastD is developing a solution, so stay tuned: [LogViewer] (en-us / 3.1 / 4-5-fastd -log-viewer.md)

### Abnormal

Exceptions in the framework are returned to the client as `json`, outputting the exact error message

`` `
HTTP 404 Not Found
`` `

`` `json
{
    "msg": "Route \" / d \ "is not found.",
    "code": 404,
    "file": "../RouteCollection.php",
    "line": 273,
    "trace": [
    ]
}
`` `

When we framework exception occurs, and do not want to export sensitive information to the client, then you can configure the shield by `config / app.php`, such as:

`` `php
<? php

return [
    // ...
    'exception' => [
        'response' => function (Exception $ e) {
            return [
                'msg' => $ e-> getMessage (),
                'code' => $ e-> getCode (),
                // 'file' => $ e-> getFile (),
                // 'line' => $ e-> getLine (),
                // 'trace' => explode ("\ n", $ e-> getTraceAsString ()),
            ];
        },
    ],
    // ...
];
`` `

The principle is very simple:

`` `php
<? php

// ...
$ handle = config () -> get ('exception.handle');
$ response = json ($ handle ($ e), $ statusCode);
// ...
`` `

### Log processing

The logging service relies on [monolog] (https://github.com/Seldaek/monolog), which logs exception messages in the application when an exception occurs.

> 3.1 start log configuration enhanced to array processing, support for custom log format and transmission

Configuration:

`` `php
<? php
return [
    'log' => [
        [\ Monolog \ Handler \ StreamHandler :: class, 'error.log', \ Monolog \ Logger :: ERROR]
    ],
];
`` `

The array accepts four parameters, respectively, into: handler, log file, level, formatter

Achieve principle:

`` `php
<? php
$ logger = new \ Monolog \ Logger (app () -> getName ());
list ($ handle, $ name, $ level, $ format) = array_pad ([\ Monolog \ Handler \ StreamHandler :: class, 'error.log', \ Monolog \ Logger :: ERROR], 4, null);

if (is_string ($ handle)) {
    $ handle = new $ handle ($ path. '/'. $ name, $ level);
}
null! == $ format && $ handle-> setFormatter (is_string ($ format)? new \ Monolog \ Formatter \ LineFormatter ($ format): $ format);
$ logger-> pushHandler ($ handle);
`` `

### Centralized log processing

When we apply excessive distribution, we need to consider how to manage the log together to facilitate the investigation, analysis. If the use of Swoole is about to be an easy thing to do. Start our log server and post each application log to the log server.

Only need to submit data in the application, data processing can be done in the log server. Monolog can be used [monolog-reader] (https://github.com/RunnerLee/monolog-reader) for analysis.

`` `php
<? php
return [
    'log' => [
        [new \ Monolog \ Handler \ SocketHandler ('schema: // host: port'), 'error.log', \ Monolog \ Logger :: ERROR]
    ],
];
`` `

After the server receives and submits the information, parses the log, bulk storage, and then respond to the corresponding response can be.

Next Section: [Application Configuration] (en-us / 3.1 / 3-1-configuration.md)
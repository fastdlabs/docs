# Abnormal and log processing

Framework provides basic error handling, you can centrally handle a variety of exceptions. The log default storage path is in `runtime / logs`. You can centrally send the logs to a log server according to business requirements.

### Abnormal response

Depending on the configuration, exceptions in the framework are returned to the client as json and logged.

Application Exception Handling Configuration in Basic Configuration Example:
`` `php
<? php
 
return [
    // some code
    'exception' => [
        'response' => function (Exception $ e) {
            return [
                'msg' => $ e-> getMessage (),
                'code' => $ e-> getCode (),
            ];
        },
        'log' => function (Exception $ e) {
            return [
                'msg' => $ e-> getMessage (),
                'code' => $ e-> getCode (),
                'file' => $ e-> getFile (),
                'line' => $ e-> getLine (),
                'trace' => explode ("\ n", $ e-> getTraceAsString ()),
            ];
        }
    ],
    // some code
];
`` `

When the application is released abnormally, it will respond to the client according to the option configured in `exception.response` and will record the exception log into the log file according to the` exception.log` configuration item, by default in `runtime / logs` storage.

### Local file record

The logging service relies on [monolog] (https://github.com/Seldaek/monolog), which logs exception messages in the application when an exception occurs.

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

### socket remote storage

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

### LogStash log format

If our log analysis system uses ELK for processing, you can use the `\ FastD \ Logger \ Formatter \ StashFormatter` log format for storage.

Change setting:

`` `php
<? php

return [
    // some code
    'log' => [
        [
            \ Monolog \ Handler \ StreamHandler :: class,
            'info.log',
            \ FastD \ Logger \ Logger :: INFO,
            \ FastD \ Logger \ Formatter \ StashFormatter :: class,
        ],
    ],
    // some code
];
`` `

Then start the logstash agent, collecting logs, to complete the configuration.

Complete Tutorial: [FastD Best Practices 5: Building an ELK Log Analysis System] (blog / practice / practice-5-created-log)

Next Section: [Unit Testing] (en-us / advanced / 3-1-testcase.md)
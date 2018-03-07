# Abnormal and log processing

### Abnormal

Exceptions in the framework are returned to the client as `json`, outputting the exact error message

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

### Log processing

The log service relies on [monolog] (https://github.com/Seldaek/monolog)

Log in the default development environment and test environment will not be created, when the environment is running in a production environment, it will automatically create an access log, error log, the log can be processed according to transaction log processing.

Configuration:

`` `php
return [
    'log' => [
        'path' => 'storage',
        'info' => \ Monolog \ Handler \ StreamHandler :: class, // Access to the log
        'error' => \ Monolog \ Handler \ StreamHandler :: class, // error log
    ],
];
`` `

When the log is stored locally, fill the path option, the path will be automatically spliced ​​in the application directory, so the path is better to distinguish between directories, and this time info, error options are optional, the default `\ Monolog \ Handler \ StreamHandler` for storage.

When you need to modify the StreamHandler, directly mapped StreamHandler class name can be.

When you need other storage methods, you can directly instantiate a logger object.

Next Section: [Application Configuration] (en-us / 3.0 / 2-6-docuemnt.md)
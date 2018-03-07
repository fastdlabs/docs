# Monitoring

Compared to PHP developers, we deeply feel that developers are not easy. From development, operation and maintenance to troubleshooting and problem solving. That's why we've also integrated [ELK] (https://www.elastic.co/) into the business development framework as one of the ways to do this.

Use ELK can easily record our application log, can be distributed to a number of businesses unified recovery to a centralized analysis.

#### Environmental requirements:

* swoole> 1.9.9
* elasticsearch> = 5.0
* logstash> = 5.0
* kibana> = 5.0

#### renderings:

! [] (assets / elk.jpg)

#### use

Set `app.php` log format library` \ FastD \ Logger \ Formatter \ StashFormatter :: class`, the log can be unified processing to complete the configuration.

Example:
 
`` `php
<? php

return [
    // code ...
    'log' => [
        [
            \ Monolog \ Handler \ StreamHandler :: class,
            'info.log',
            \ FastD \ Logger \ Logger :: INFO,
            \ FastD \ Logger \ Formatter \ StashFormatter :: class,
        ],
    ],
    // code ...
];
`` `

> Enable unified log collection processing Prerequisites The ELK log analysis system needs to be installed. Can refer to: [ELK Chinese Guide] (https://kibana.logstash.es/content/logstash/get-start/install.html)

Open `logstash` to collect logs and push` bin / logstash -f path / to / log`

When done, you can access the business process and generate logs to test it.

Next Section: [Life Cycle] (en-us / 4-1-lifecycle.md)
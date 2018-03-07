# connection pool

Beginning with version 3.1, join the Swoole Server connection pool. In Swoole Server, the callback `workerStart` automatically starts the connection pool.

#### Connection pooling

In Server 'onWokerStart` callback, the program will call `app ()` function to recurse all services. If the service is implemented in `FastD \ Pool \ PoolInterface` interface, the` initPool` method will be called automatically when Server starts up, Under this method to perform the connection, unless the Worker interrupts, otherwise it will always be connected.

`` `php
<? php

namespace FastD \ Pool;

use Medoo \ Medoo;
use FastD \ Model \ Database;

class DatabasePool implements PoolInterface
{
    / **
     * @var Medoo []
     * /
    protected $ connections = [];

    / **
     * @var array
     * /
    protected $ config;

    / **
     * Database constructor.
     *
     * @param array $ config
     * /
    public function __construct (array $ config)
    {
        $ this-> config = $ config;
    }

    / **
     * @param $ key
     *
     * @return Database
     * /
    public function getConnection ($ key)
    {
        if (! isset ($ this-> connections [$ key])) {
            $ config = $ this-> config [$ key];
            $ this-> connections [$ key] = new Database ([
                'database_type' => isset ($ config ['adapter'])? $ config ['adapter']: 'mysql',
                'database_name' => $ config ['name'],
                'server' => $ config ['host'],
                'username' => $ config ['user'],
                'password' => $ config ['pass'],
                'charset' => isset ($ config ['charset'])? $ config ['charset']: 'utf8',
                'port' => isset ($ config ['port'])? $ config ['port']: 3306,
                'prefix' => isset ($ config ['prefix'])? $ config ['prefix']: '',
            ]);
        }

        return $ this-> connections [$ key];
    }

    / **
     * {@inheritdoc}
     * /
    public function initPool ()
    {
        foreach ($ this-> config as $ name => $ config) {
            $ this-> getConnection ($ name);
        }
    }
}
`` `

Then injected into the container via ServiceProvider, refer to [ServiceProvider] (3-8-service-provider.md)

Start the server, it will be connected to each worker which should be noted that all of each worker is independent, that is, if you open 20 workers, it will produce 20 connections.

`` `

Server: fast-d
App version 2.0.0 (dev)
Swoole version 1.9.5
PID file: /Users/janhuang/Documents/htdocs/me/fastd/fastd/tests/config/../runtime/pid/fast-d.pid, PID: 23683
Server udp: //0.0.0.0:9527
Server Master [23683] is started
Server Worker [23695] is started [15]
Server Worker [23690] is started [10]
Server Worker [23691] is started [11]
Server Worker [23692] is started [12]
Server Worker [23693] is started [13]
Server Worker [23694] is started [14]
Server Worker [23696] is started [16]
Server Worker [23697] is started [17]
Server Worker [23698] is started [18]
Server Worker [23699] is started [19]
Server Worker [23700] is started [20]
Server Worker [23701] is started [21]
Server Worker [23702] is started [22]
Server Worker [23703] is started [23]
Server Worker [23704] is started [24]
Server Worker [23705] is started [25]
Server Worker [23706] is started [26]
Server Worker [23707] is started [27]
Server Worker [23708] is started [28]
Server Worker [23709] is started [29]
Server Worker [23710] is started [0]
Server Worker [23711] is started [1]
Server Worker [23712] is started [2]
Server Worker [23713] is started [3]
Server Worker [23714] is started [4]
Server Worker [23715] is started [5]
Server Worker [23716] is started [6]
Server Worker [23717] is started [7]
Server Worker [23718] is started [8]
Server Manager [23689] is started
Server Worker [23719] is started [9]
`` `

Next Section: [Extensions] (en-us / 3.1 / 3-11-extend.md)
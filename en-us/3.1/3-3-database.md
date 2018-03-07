# Database

Frame mode uses the [medoo] (https://github.com/catfan/Medoo) framework to provide the easiest operation. If you want to use ORM friends can try to add [ServiceProvider] (zh-cn / 3.1 / 3-8-service-provider.md), as an extension of the framework.

> Beginning with version 3.1, the structure of a one-dimensional array is changed to a two-dimensional array configuration. The database operations consider changing the medoo to an optional extension and consider using other database operations for replacement. ORM is not built into the framework and may be supplemented with an extension.

### Basic medoo use

ORM framework

* [doctrine2] (https://github.com/doctrine/doctrine2)
* [redbean] (https://github.com/gabordemooij/redbean)
* [propel2] (https://github.com/propelorm/Propel2)

Database configuration:

`` `php
<? php
return [
    'default' => [
        'adapter' => 'mysql',
        'name' => 'ci',
        'host' => '127.0.0.1',
        'user' => 'travis',
        'pass' => '',
        'charset' => 'utf8',
        'port' => 3306,
    ]
];
`` `

The framework provides helper functions: `database ()`, which returns a `Medoo \ Medoo` object. Provide the most primitive operation, the detailed Medoo operation document: [Medoo Doc] (http://medoo.in/doc).

### database model

The framework provides a simple database model, does not provide complex operations such as ORM, because the positioning itself is not here, if you want to use ORM and other operations, you can customize [Service Provider] (3-8-service-provider.md) To expand.

The model does not mandate the inheritance of `FastD \ Model \ Model`, but at initialization time of each model, the` medoo` object is injected into the constructor by default and is assigned to the `db` property.

`` `php
$ model = model ('demo');
`` `

Model placed in the Model directory, without the directory, you need to manually create the directory, by using the `model` method, the namespace will be automatically spliced ​​to the model name before, and the model name does not need to bring the Model, Such as: `model ('demo' ')` is equal to `new Model \ DemoModel`.

### Datasheet structure

Beginning with version 3.1, support for building simple datasheet models and building basic datasheet models with simple commands.

`` `shell
$ php bin / console seed: create Hello
`` `

The file is built in the `database` directory and its name is automatically constructed as follows:

`` `php
<? php

use FastD \ Model \ Migration;
use Phinx \ Db \ Table;

class Hello extends Migration
{
    / **
     * Set up database table schema
     * /
    public function setUp ()
    {
        // create table
        $ table = $ this-> table ('demo');
        $ table-> addColumn ('user_id', 'integer')
            -> addColumn ('created', 'datetime')
            -> create ();
    }
    
    public function dataSet (Table $ table) {
        
    }
}
`` `

By implementing the setUp method, add the database structure to facilitate the table structure migration.

Prepared to complete the preliminary table structure, run the command:

`` `shell
$ php bin / console seed: run
`` `

Automatically build data tables, but need to manually create the database. The specific operation can be referred to: [phinx] (https://tsy12321.gitbooks.io/phinx-doc/writing-migrations-working-with-tables.html)

### connection pool

When the Swoole service is implemented, the database will start a connection pool, connect to the database when `onWorkerStart` starts, and check whether the connection is disconnected at the time of operation, to realize the disconnection reconnection mechanism and disconnection. Note: [MySQL Disconnected] (https://wiki.swoole.com/wiki/page/350.html)

Achieve principle:

The framework provides a `PoolInterface` interface class that implements the` initPool` method.

`` `php
<? php

namespace FastD \ Pool;

use FastD \ Model \ Database;

/ **
 * Class DatabasePool.
 * /
class DatabasePool implements PoolInterface
{
    / **
     * @var Database []
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
            if (! isset ($ this-> config [$ key])) {
                throw new \ LogicException (sprintf ('No set% s database', $ key));
            }
            $ config = $ this-> config [$ key];
            $ this-> connections [$ key] = new Database (
                [
                    'database_type' => isset ($ config ['adapter'])? $ config ['adapter']: 'mysql',
                    'database_name' => $ config ['name'],
                    'server' => $ config ['host'],
                    'username' => $ config ['user'],
                    'password' => $ config ['pass'],
                    'charset' => isset ($ config ['charset'])? $ config ['charset']: 'utf8',
                    'port' => isset ($ config ['port'])? $ config ['port']: 3306,
                    'prefix' => isset ($ config ['prefix'])? $ config ['prefix']: '',
                ]
            );
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

`` `php
<? php
// ...
public function onWorkerStart ()
{
    foreach (app () as $ service) {
        if ($ service instanceof FastD \ Pool \ PoolInterface) {
            $ service-> initPool ();
        }
    }
}
// ...
`` `

Next Section: [Cache] (en-us / 3.1 / 3-4-cache.md)
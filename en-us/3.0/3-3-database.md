# Database

FastD 3.0 default integration [medoo] (https://github.com/catfan/Medoo) framework, providing the most convenient operation. If you want to use ORM friends can try to add [ServiceProvider] (3-8-service-provider.md), as an extension of the framework.

### Basic medoo use

ORM framework

* [doctrine2] (https://github.com/doctrine/doctrine2)
* [redbean] (https://github.com/gabordemooij/redbean)
* [propel2] (https://github.com/propelorm/Propel2)

Database configuration:

`` `php
<? php
return [
    'database_type' => 'mysql',
    'database_name' => 'database name',
    'server' => 'database host',
    'username' => 'database user',
    'password' => 'database pass',
    'charset' => 'utf8',
    'port' => 3306,
];
`` `

Framework provides auxiliary functions: `database ()`, the function returns a medoo object. Provide the most primitive operation, detailed medoo operation document: [Medoo Doc] (http://medoo.in/doc).

If you have a better choice, please provide me documentation or PR.

### database model

The framework provides a simple database model and does not provide complicated operations such as ORM for the time being because the positioning itself is not here. If you want to use ORM and other operations, you can customize the [Service Provider] (en-us / 3.0 / 3-8- service-provider.md) to expand.

The model does not mandate the inheritance of `FastD \ Model \ Model`, but at initialization time of each model, the` medoo` object is injected into the constructor by default and is assigned to the `db` property.

`` `php
$ model = model ('demo');
`` `

Model placed in the Model directory, without the directory, you need to manually create the directory, by using the `model` method, the namespace will be automatically spliced ​​to the model name before, and the model name does not need to bring the Model, Such as: `model ('demo' ')` is equal to `new Model \ DemoModel`.


Next Section: [Command Line] (en-us / 3.0 / 3-4-cache.md)
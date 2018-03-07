# ORM

FastD ORM is based on Eloquent to expand, so in use and Eloquent is consistent, very easy to use.

### Installation

`` `php
$ composer require zqhong / fastd-eloquent
`` `

After the installation is successful, add to the app.php registration service

`` `php
<? php
return [
    // omitted irrelevant configuration
    'services' => [
        \ ServiceProvider \ EloquentServiceProvider :: class,
    ],
];
`` `

### use

`` `php
<? php
// create
eloquent_db ('default')
    -> table ('demo')
    -> insert ([
        'content' => 'hello world',
    ]);

// read
// parameter can be omitted, the default value is default
eloquent_db ()
    -> table ('demo')
    -> where ('id', 1)
    -> where ('created_at', '<=', time ())
    -> get ([
        'id',
        'content',
    ]);
`` `

### Other related information

If you are interested in using Eloquent in other frameworks, refer to this article in Slim - [Using Eloquent with Slim. ] (https://www.slimframework.com/docs/cookbook/database-eloquent.html)

If you are unfamiliar with Eloquent, please read the information below.

* Laravel - Database: Query Builder
* Laravel - Database: Pagination
* Laravel - Eloquent: Getting Started
* Laravel - Eloquent: Collections

Developer: [zqhong] (https://github.com/zqhong/fastd-eloquent)
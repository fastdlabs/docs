# unit test

Unit testing relies on [testing] (https://github.com/JanHuang/testing) the underlying package Http Server Request object, and add `Faker` function.

> 3.1, FastD \ Test \ TestCase to FastD \ TestCase

`` `php
<? php

use FastD \ TestCase;


class IndexControllerTest extends TestCase
{
    public function testSayHello ()
    {
        $ request = $ this-> request ('GET', '/');

        $ response = $ this-> handleRequest ($ request);

        $ this-> response ($ response, ['foo' => 'bar']);
    }
}
`` `

Unit testing try to simulate the Http request, matching the response to the proof of results to achieve the desired way to test.

### database test

Database Testing depends on `phpunit / dbunit` for extensions, extending the trait from dbunit to implement the dataset connection method interface

Specific reference: [database testing] (https://phpunit.de/manual/current/zh_cn/database.html)

Database testing supports databaseless testing. When a developer does not configure a database connection, the framework selects the normal default test, does not create a database connection, and is consistent with the unit test.

Dataset data stored in: `database / dataset` naming rules:` {table} .yml`, internally defined as a row for each array record.

`` `yml

    id: 1
    content: "Hello buddy!"
    user: "joe"
    created: 2010-04-24 17:15:23
`` `

Here to pay attention to the database test process, each test process will reset the database is completed.

Next: [Accessibility] (en-us / 3.1 / 3-7-helpers.md)
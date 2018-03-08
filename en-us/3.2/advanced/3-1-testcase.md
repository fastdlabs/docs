# unit test

Unit testing relies on the [testing](https://github.com/JanHuang/testing) underlying package Http Server Request object, and to provide the database to fill and test, greatly improving the test coverage.

> 3.1, FastD\Test\TestCase 改为 FastD\TestCase

### API test

The development of the general use of the browser or cURL test the development of the interface, did not consider most of the processing, which determine the stability of the interface is not desirable. So to provide unit testing, hoping to improve the situation.

!> API Testing Need to inherit `FastD\TestCase` test object.

```php
<?php

use FastD\TestCase;


class IndexControllerTest extends TestCase
{
    public function testSayHello()
    {
        // 模拟请求
        $request = $this->request('GET', '/');
        // 处理请求并获取响应对象
        $response = $this->handleRequest($request);
        // 对响应进行断言
        $this->response($response, ['foo' => 'bar']);
    }
}
```

> Unit test try to simulate Http request, matching the results of the proof-reading to achieve the desired way to test. In addition, the data situation in more cases can be simulated to ensure that the data processing is accurate enough.

### Class library testing

In addition to the API routine development operations, in addition to the preparation of some auxiliary classes, but also need to conduct a comprehensive test of the relevant classes to refine the granularity and ensure adequate stability.

> Regular testing can inherit PHPUnit directly

For example, we develop a Human class

```php
<?php

class Human
{
    public function song()
    {
        return 'chinese';
    }
}
```

Then the corresponding need to create the corresponding Test category Test Unit category.

```php
<?php

class HumanTest extends \PHPUnit_Framework_TestCase
{
    public function testSong()
    {
        $human = new Human();
        $this->assertEquals('chinese', $human->song());
    }
}
```

### database test

Database testing generally need to automatically fill in some data, and then the default data and operations assertions, to meet expectations.

We need to configure the data set to be used for unit testing to complete the data filling and full assertion.

!> Dataset data should be consistent with the data table structure, including data format

Dataset data stored in: `database/dataset` naming rules: `{table}.yml`, internally defined as a row for each array record.

```yml

    id: 1
    content: "Hello buddy!"
    user: "joe"
    created: 2010-04-24 17:15:23
```

Here to pay attention to the database test process, each test process will reset the database is completed.

Next section: [Accessibility](en-us/3.2/advanced/3-2-helpers.md)
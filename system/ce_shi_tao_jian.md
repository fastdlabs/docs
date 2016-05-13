# 测试套件

测试是一个影响服务质量的一个重要环节，大部分的服务质量，代码质量会与产品产生直接或者间接的关系，因此在测试环节开发人员都不应该忽略。

目前大部分框架都提供单元测试，行为驱动测试等功能，FastD 框架也集成 PHPUnit 测试套件进行单元测试。

测试目录: `{bundle}/Testing`

### ＃断言测试

我们在编写完 API 接口，页面的时候，是否需要测试地址的可用性？是否直接通过浏览器去测试？试想一下，如果你已经有数十个接口页面的时候，你还能通过浏览器进行访问测试吗？显然不能，因此，自动化测试在我们开发当中是饰演着一个多么重要而又经常被忽略的角色。

示例代码:

```php
<?php

namespace WelcomeBundle\Testing;

use FastD\Framework\Tests\WebTestCase;

class IndexControllerTest extends WebTestCase
{
    public function testIndexAction()
    {
        $client = static::createClient();

        $response = $client->testResponse('GET', '/welcomebundle/');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
```
# 单元测试

单元测试依赖于 [testing](https://github.com/JanHuang/testing) 底层封装 Http Server Request 对象，并且提供对数据库的填充和测试，大大提高测试的覆盖率。

> 3.1 开始，FastD\Test\TestCase 改为 FastD\TestCase

### API 测试

一般开发使用浏览器或者 cURL 的形式测试开发的接口，没有考虑大部分情况下的处理，由此判断接口的稳定性是不可取的。因此提供单元测试，希望能够改善这个情况。

!> API 测试需要继承 `FastD\TestCase` 测试对象。

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

> 单元测试尽量模拟 Http 请求，对响应结果进行匹配校对，来达到预期的方式进行测试。另外可以模拟更多情况下的数据情况，以确保对数据处理是足够精确的。

### 类库测试

除了 API 常规开发操作之外，另外在编写部分辅助类的时候，也需要对相关类进行完善的测试，来细化粒度和保证足够稳定。

> 常规测试可以直接继承 PHPUnit

例如我们开发一个 Human 类

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

那么对应的需要在 Testing 目录创建对应 Unit 测试类。

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

### 数据库测试

数据库测试一般需要自动填充一些数据，然后对预设的数据和操作进行断言，能够符合预期。

我们需要配置数据集，用于单元测试的时候能够完成数据填充和进行充分断言。

!> 数据集数据请与数据表结构保持一致，包括数据格式 

数据集数据存放在: `database/dataset`，命名规则为: `{table}.yml`，内部定义为每一个数组为一行记录。

```yml

    id: 1
    content: "Hello buddy!"
    user: "joe"
    created: 2010-04-24 17:15:23
```

此处要注意数据库的测试流程，每个测试进程完成后会重置数据库。

下一节: [辅助函数](zh-cn/advanced/3-2-helpers.md)

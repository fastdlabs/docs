# 请求处理

Http 请求处理来源于 [Http](https://github.com/JanHuang/http) 组件，由其提供强大的 Http 解析预处理，支持 Swoole.

当用户发起一个 Http 请求的时候，[Http](https://github.com/JanHuang/http) 组件会将请求封装成一个 ServerRequestInterface 实现类，实现 [PSR7](http://www.php-fig.org/psr/psr-7/) 标准，并且将对象传递到控制器中。

> 由于 Http 解析是通过 parse_url 进行解析的，因此您需要配置好你的虚拟域名(virtual-host)进行访问，否则会提示 route 404 not found

由于 Http 组件实现 PSR7，所以用法是保持 PSR7 一致，操作可以根据 [Http](https://github.com/JanHuang/http) 进行查看

#### 获取 $_GET

利用 `getQueryParams()` 方法获取所有 `$_GET` 参数。

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        $get = $request->getQueryParams();
        // some code
    }
}
```

可以利用 `getParam()` 获取具体参数，例外方法内置判断参数是否存在，因此接受两个参数，第二个作为默认值，当不存在该值的时候，会默认返回第二个参数。如:

```php
$request->getParam("foo", "bar");
```

当没有 `foo` 索引的时候，就会默认返回 `bar` 的值。

#### 获取 $_POST

利用 `getParsedBody()` 方法获取所有 `$_GET` 参数。

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        $post = $request->getParsedBody();
        // some code
    }
}
```

可以利用 `getParam()` 获取具体参数，例外方法内置判断参数是否存在，因此接受两个参数，第二个作为默认值，当不存在该值的时候，会默认返回第二个参数。如:

```php
$request->getParam("foo", "bar");
```

当没有 `foo` 索引的时候，就会默认返回 `bar` 的值。

#### 获取 PUT/DELETE

由于 PUT/DELETE 等请求方法相对特殊，数据需要在请求的源数据进行获取，并解析到 `body` 中。

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        $raw = (string) $request->getBody();
        $body = $request->getParsedBody();
        // some code
    }
}
```

#### 获取 $_COOKIE

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        $cookies = $request->getCookieParams();
        $cookie = $request->getCookie('foo', 'bar');
        // some code
    }
}
```

#### $_FILES 文件上传

利用 `getUploadedFiles` 方法可以很轻松获取上传的文件，方法返回一个 `FastD\Http\UploadedFile` 对象，对象继承 `CURLFile` 并实现自 PSR7 的 `UploadedFileInterface`。

上传单个文件可以获取数组索引，进行操作，键名来自于 form 表单的 `name` 属性。

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        $files = $request->getUploadedFiles();
        $files['test']->moveTo('/path/to/upload');
        // some code
    }
}
```

多个文件上传，可以利用 `foreach` 对数组进行迭代。

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        foreach ($request->getUploadedFiles() as $file) {
            $file->moveTo('/path/to/upload');
        }
        // some code
    }
}
```

上传成功后返回一个文件的存储位置。`moveTO` 方法仅需要指定目录即可，文件系统会自动给其利用 `md5_file` 重新命名。

#### Session 的实现

框架不提供 Session 处理，但可以利用 Cookie 进行实现，亦可以通过 Session 组件进行扩展。[session](https://github.com/janhuang/session)

利用 Cookie 记录 `session_id`，再次利用 `session_id` 查询对应 Session 内容，就能实现 session 的功能。

下一节: [响应处理](zh-cn/basic/2-4-response-handling.md)
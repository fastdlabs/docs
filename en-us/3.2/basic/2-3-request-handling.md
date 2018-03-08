# Request processing

Http request processing comes from [Http](https://github.com/JanHuang/http) components, which provide powerful Http parsing preprocessing, support for Swoole.

When a user initiates a Http request, the [Http](https://github.com/JanHuang/http) component encapsulates the request into a ServerRequestInterface implementation class, implementing [PSR7] (http: //www.php-fig .org / psr / psr-7 /) standard and pass the object to the controller.

> Since Http parsing is done through parse_url, you need to configure your virtual-host to access otherwise the route 404 not found

Since Http components implement PSR7, the usage is to keep PSR7 consistent, and operations can be viewed according to [Http](https://github.com/JanHuang/http)

#### Get $_GET

Get all `$_GET` parameters using the `getQueryParams()` method.

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

`getParam()` can be used to obtain specific parameters, the exception method built-in to determine whether the parameter exists, so take two parameters, the second as the default value, when the value does not exist, the default returns the second parameter. Such as:

```php
$request->getParam("foo", "bar");
```

When there is no `foo` index, the value of` bar` is returned by default.

#### Get $_POST

Get all the $_POST parameters with the `getParsedBody()` method.

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

`getParam()` can be used to obtain specific parameters, the exception method built-in to determine whether the parameter exists, so take two parameters, the second as the default value, when the value does not exist, the default returns the second parameter. Such as:

```php
$request->getParam("foo", "bar");
```

When there is no `foo` index, the value of` bar` is returned by default.

#### Get PUT/DELETE

Due to the relatively special request methods such as PUT / DELETE, the data needs to be retrieved from the requested source data and parsed into `body`.

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

#### Get $_COOKIE

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

#### $_FILES file upload

Using the `getUploadedFiles` method makes it easy to get uploaded files. The method returns a `FastD\Http\UploadedFile` object, which inherits `CURLFile` and implements `UploadedFileInterface` from PSR7.

Upload a single file can get the array index, the operation, the key name from the form 's name attribute.

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

Multiple file upload, you can use `foreach` to iterate over the array.

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

After the upload is successful, a file's storage location is returned. `moveTO` method only need to specify the directory, the file system will automatically give them the use of `md5_file` rename.

#### Raw source data

In some special scenes, we can not get the data directly using $ _POST, only through `file_get_contents('php://input')`. The raw source data can be obtained by clicking

```php
namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        $raw = (string) $request->getBody();
        
    }
}
```

#### Session support

Session is currently using the most concise way to integrate, through the service provider configuration, simply register to the service to open the session feature.

github: [session-provider](https://github.com/fastdlabs/session-provider)

Next Section: [Response Processing](en-us/3.2/basic/2-4-response-handling.md)
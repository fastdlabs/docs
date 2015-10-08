#请求与响应

每个路由对应每个HTTP请求，HTTP请求会被框架封装成 Request 对象，可以通过 Request 对象获取相关请求信息。

##1.请求(Request)

获取 `FastD\Http\Request` 请求对象有多个方法，以下一一举例：

####1.推荐方式：**参数注入**

```php
use FastD\Http\Request;

class Demo
{
    public function demoAction(Reqeuest $request)
    {
        return $request->query->hasGet('name', 'janhuang');
    }
}

Routes::get('/', 'Demo@demoAction');
```

以上示例是，注入一个 `Request` 对象(**注意命名空间**)作为参数传入，可以直接操作对象，Request 的完整路径是 `FastD\Http\Request`。

访问 `/` 根域名，传入 get 参数: `http://path/to/domain/?name=demo`，如果没有找到 `name`，那就默认是 `janhuang` 字符串


####2.通过BaseEvent获取

```php

use FastD\Http\Request;
use FastD\Framework\Events\BaseEvent;

class Demo extends BaseEvent
{
    public function demoAction(){
        $request = $this->getRequest();
        return $request->query->hasGet('name', 'janhuang');
    }
}

Routes::get('/', 'Demo@demoAction');

```

效果和以上一样。

####3.通过 Request::createRequestHandle 方法获取(不推荐)

```php

use FastD\Http\Request;

class Demo extends BaseEvent
{
    public function demoAction(){
        $request = Request::createRequestHandle;
        return $request->query->hasGet('name', 'janhuang');
    }
}

Routes::get('/', 'Demo@demoAction');

```

效果虽说和以上两个示例一样，但是在编码上更加不雅观，咱们搞(xie)艺(dai)术(ma)的，应该要有点原则和逼格，要给别人一种专业，高端的感觉，但同时要保持低调谦虚，不然这圈子就白混了。

###获取提交参数

####1.GET

```php
$request->query->get('name');
$request->query->hasGet('name', $default);
```

####2.POST | PUT | DELETE

```php
$request->request->get('name');
$request->request->hasGet('name', $default);
```

参数都会默认过滤掉 script 和 iframe 标签，如果需要自定义过滤，需要输入 3，4参数

## `FastD\Http\Attribute Extends FastD\Http\Attribute` 

`Http` 请求对象，

```php
Request::get(string $name, boolean $raw = false, Closure $callback);
```

####string $name

    参数名
    
####boolean $raw
    
    是否不转义和不过滤，默认为false，全部过滤，true则不过滤
    
####\Closure $callback

    回调，需要自定义过滤的回调函数，接受一个参数内容，参数来源与请求参数内容。
    如:
        function ($name) {
            return md5($name);
        }

而 `hasGet` 方法则对应多一个判断，第二个参数代表如果找不到$name参数，则会使用第二个参数值，其他参数作用与上面一样



##2.响应(Response)

框架除了统一了请求入口，还统一了出口(Response)。至于统一出口的好处大家可以继续研究下。

这里要求每个响应方法都必须返回(return) 一个基于 `FastD\Http\Response` 的对象或者字符串，否则系统会提示异常。因为每个方法都是有返回值的，所以在模块与模块之间调用会变得异常方便，而且处理对象完全是系统统一处理，所以会大大降低非一致性问题。这里需要注意一点就是，不要随意在处理方法中进行输出，这是不规范并且不安全的。

在事件处理对象当中，方法中必须 `return`， 如上述例子:

```php
class Demo
{
    public function demoAction(Reqeuest $request)
    {
        return $request->query->hasGet('name', 'janhuang');
    }
}
```

方法中默认返回GET参数name，系统判断到是返回字符串，默认为其他产生一个Response对象，结果和: `return new Response($request->query->hasGet('name', 'janhuang'))` 一样.

`FastD\Http\Response` 对象构造方法接受三个参数:

```php
FastD\Http\Response::__construct(string $data, int $status = Response::HTTP_OK, array $headers = []);
```

####string $data
    响应数据，如果要响应json或者其他格式数据，需要进行序列化，设置相应的响应头
    
####int $status

    响应状态码，即http状态码
    
####array $headers
    
    自定义响应头，具体请了解http协议的response headers
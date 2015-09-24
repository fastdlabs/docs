#请求与响应

每个路由对应每个HTTP请求，HTTP请求会被框架封装成 Request 对象，可以通过 Request 对象获取相关请求信息。

获取 Request 请求对象有多个方法，以下一一举例：

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

以上示例是，注入一个Request对象(**注意命名空间**)作为参数传入，可以直接操作对象，Request 的完整路径是 `FastD\Http\Request`。


####2.通过BaseEvent获取

```php

use FastD\Http\Request;

class Demo extends
{
    public function demoAction(Reqeuest $request){
        return $request->query->hasGet('name', 'janhuang');
    }
}

Routes::get('/', 'Demo@demoAction');

```

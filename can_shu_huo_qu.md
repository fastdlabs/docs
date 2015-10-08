#参数获取

一般 `http` 请求有 `GET,POST,DELETE,PUT,OPTION` 等，但是常用基本都是 `GET,POST`两个，而且这两个可以满足日常大大大大部分要求。

## 获取 GET 参数

示例: `http|https://url/?name=janhuang&age=18`

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

以上结果返回 `janhuang`

##获取 POST 参数

示例: `http|https://url/`

```
request_body:
    name: janhuang
    age: 18
```

```php
use FastD\Http\Request;

class Demo
{
    public function demoAction(Reqeuest $request)
    {
        return $request->request->hasGet('name', 'janhuang');
    }
}

Routes::get('/', 'Demo@demoAction');
```

`hasGet` 方法接受 `4 个参数





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

##`FastD\Http\QueryAttribute Extends FastD\Http\Attribute` 

`GET` 参数对象，

```php
Attribute::get(string $name, boolean $raw = false, Closure $callback);
```




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

##FastD\Http\Attribute::hasGet($name, $default[, [$raw = false], [$callback = null]])

`hasGet` 方法接受 `4 个参数

####name

参数名，需要获取的参数名。

####default

如果需要获取的参数不存在，返回此设置的默认值。
    
####raw
    
是否不转义和不过滤，默认为false，全部过滤，true则不过滤
    
####callback

匿名回调，需要自定义过滤的回调函数，接受一个参数内容，参数来源与请求参数内容。

>**目前仅支持匿名函数回调**

如:
```
function ($name) {
    return md5($name);
}
```

##API


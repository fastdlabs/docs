#参数获取

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

##`FastD\Http\QueryAttribute Extends FastD\Http\Attribute` 

`GET` 参数对象，

```php
Attribute::get(string $name, boolean $raw = false, Closure $callback);
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



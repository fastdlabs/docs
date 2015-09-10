#路由配置

路由是一个框架必备的东西，至于怎么配置，各有特色。说白了，路由可以看成时 HTTP 的 URL(除domain外) 地址，也就是咱们经常说和见到并且使用的 PATHINFO。

路由配置文件在 `path/to/bundle/Resources/config/routes.php`

将来重新讲注释路由添加回去，敬请期待。

##基础路由配置

----

###GET

```
Routes::get('/', 'Class@method');
```

###POST

```
Routes::post('/', 'Class@method');
```

###PUT

```
Routes::put('/', 'Class@method');
```

###DELETE

```
Routes::delete('/', 'Class@method');
```

如此类推......

----

##动态路由

```
Routes::get('/{name}', 'Class@method');
```

动态路由变量使用花括号(`{}`) 作为标志声明。以上路由会在请求 `/jan` 或者其他值的时候触发。而动态的参数则直接在绑定的事件中作为方法参数获取即可。如上:

```
class ClassName
{
    public function methodName($name)
    {
        return $name;
    }
}
```

事件方法中的 `$name` 就是路由动态传递的值。

----

##路由对象及其配置

当在配置路由地址的时候，方法均会返回一个路由对象，而路由对象自身实现自 `FastD/Routing/RouteInterface` 接口，而接口有数个方法，可以供给路由其他参数配置使用。以下是方法列表

```

```

###路由异常

在请求非法的情况下，会返回 Http status code: `403`，也就是说，如果一个 POST 请求路使用 GET 请求，则会抛出 `403` 状态的异常

如果请求一个不存在路由，则会抛出 `404` 异常。而解决这些异常的最好办法就是使用合法的路由地址。




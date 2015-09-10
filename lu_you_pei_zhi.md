#路由配置

路由是一个框架必备的东西，至于怎么配置，各有特色。说白了，路由可以看成时 HTTP 的 URL(除domain外) 地址，也就是咱们经常说和见到并且使用的 PATHINFO。

路由配置文件在 `path/to/bundle/Resources/config/routes.php`

将来重新讲注释路由添加回去，敬请期待。

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


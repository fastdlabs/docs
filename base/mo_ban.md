# 模板

FastD 中采用了 [Twig](http://twig.sensiolabs.org/) 来作为模板引擎。并且在 FastD 框架中已经实现对其进行自定义扩展的功能。

模板文件存放于目录: `{bundle}/Resources/views`

### 渲染模板

如果在试图目录下存在 `test.twig` 文件，那么只需要在控制器中调用 `render` 方法即可对其进行渲染，减少 1.x 版本中过长的模板路径。

```php
/**
 * @Route("/twig")
 */
public function twigAction(Request $request)
{
    return $this->render('demo.twig');
}
```

模板路径：`views/demo.twig` 完整路径: `WelcomeBundle/Resources/views/demo.twig` 

已经去处过长的父级目录地址。

### 模板预定义函数

##### url

生成一个路由绝对路径地址，接受三个参数。

```php
{{ url(route, params, format) }}
```

路由对应定义的路由名称，因此说这里给路由定义名称的重要性。

params 为路由的参数，如果是动态路由，则会给路由动态添加上参数，如果参数有多余或者路由本身非动态路由，则参数会以 `query string` 的方式在地址上追加尾巴。

format 为生成路由地址的格式，也就是后缀。

##### asset

给模板生成一系列的资源路径地址，如 css，js，images等等。

```twig
{{  }}
```

### 模板扩展



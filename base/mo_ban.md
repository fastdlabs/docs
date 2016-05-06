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

### 模板资源映射命令

在模板中，可能需要用上很多的资源，如 css，js，images 等资源，每个地址都是一个静态的请求，所以建议这部分工作直接有 `nginx` 或者其他服务器进行接管。

模板资源目录: `{bundle}/Resources/assets`

```
php bin/console asset:install
```

安装成功后，会在 `public` 目录下生成 `bundles/{bundle}` 软链接，按照不同的 bundle 名进行目录划分。

### 模板预定义函数

##### ＃url

生成一个路由绝对路径地址，接受三个参数。

```
{{ url(route, params, format) }}
```

路由对应定义的路由名称，因此说这里给路由定义名称的重要性。

params 为路由的参数，如果是动态路由，则会给路由动态添加上参数，如果参数有多余或者路由本身非动态路由，则参数会以 `query string` 的方式在地址上追加尾巴。

format 为生成路由地址的格式，也就是后缀。

##### ＃asset

给模板生成一系列的资源路径地址，如 css，js，images等等。函数需要依赖资源命令进行映射，才能访问，因此在使用该函数前，请确保已经将资源链接到 `public` 目录中。

**初衷:** 每个 bundle 都应该有属于自己的资源模块及样式，并且不依赖于主体，这样，每个模块才可以实现独立部署，独立运行，否则当样式或其他资源是需要依附到其他模块，那本身模块就不能算是一个独立的组件模块甚至独立地运行。

```
{{ asset(path, version = null) }}
```

方法最终会生成一个资源链接地址，格式为: `//path/to/public/resources.js`

如果有版本参数，则会追加版本尾巴: `?v=1.0.0`

### 模板扩展

twig 自身支持模块扩展，具体请看文档: [Twig Extension](http://twig.sensiolabs.org/doc/advanced.html#creating-an-extension).

框架已经将一套扩展整合到自身当中，简化了整体的实现方法，只需要简单实现想要的功能即可。

```php
<?php

namespace Welcome\Extensions;

use FastD\Framework\Extensions\TplExtension;
use Twig_SimpleFilter;
use Twig_SimpleFunction;

class DemoExtensions extends TplExtension
{
    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'demo';
    }

    /**
     * Returns a list of filters to add to the existing list.
     *
     * @return Twig_SimpleFilter[]
     */
    public function getFilters()
    {
        return [
            new Twig_SimpleFilter('demo_filter', function () {
                return 'demo_filter';
            })
        ];
    }

    /**
     * Returns a list of functions to add to the existing list.
     *
     * @return Twig_SimpleFunction[]
     */
    public function getFunctions()
    {
        return [
            new Twig_SimpleFunction('demo_func', function () {
                return 'demo_func';
            }),
        ];
    }
}
```

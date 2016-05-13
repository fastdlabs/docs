# 路由

路由是一个框架必备的东西，配置的方式参考了 Laravel 和 Symfony 两个框架。框架在开发环境和测试环境中支持注释路由。

路由配置文件在 `{bundle}/Resources/config/routes.php`

### ＃基础路由配置

每个对外访问的地址都需要通过手动开发，所以在需要进行配置，而且在配置的时候，应该要考虑地址的合理性，如同门牌号，一旦发布，想要更改就很难了。

##### ＃GET

该路由地址只能通过 Get 访问

```php
Routes::get('base', '/base', \WelcomeBundle\Controllers\Index::class.'@indexAction');
```

当访问 `/base` 抵制的时候，`\WelcomeBundle\Controllers\Index` 下的 `indexAction` 将会被执行。路由这里的第一个参数，是路由的名字，在其他地方进行调用的时候可以通过该名字直接进行调用

##### ＃POST

POST 请求路由地址

```php
Routes::post('base_post', '/base', \WelcomeBundle\Controllers\Index::class.'@postAction');
```

路由配置支持:

* get
* post
* put
* delete
* patch
* any (意指允许所有请求方法到达路由)

### ＃动态路由

```php
Routes::get('dynamic', '/{name}', \WelcomeBundle\Controllers\Index::class.'@dynamicAction');
```

**Action**

```php
 public function dynamicAction($name)
{
    return $this->response('This variable is ' . $name);
}
```

访问地址: `/janhuang` 即可出现 `This variable is janhuang` 等字样，动态路由配置成功。

而动态路由中的参数 `{name}` 会作为控制器方法动态传递到方法中 `dynamicAction($name)` ，如果多个路由参数，则是根据路由参数顺序传递到控制器方法参数中。


### ＃路由组

路由组可以说是一系列路由的前缀。

```php
Routes::group('/user', function () {
    Routes::get('user_profile', '/profile', \WelcomeBundle\Controllers\Index::class.'@profileAction');
});
```

`/user` 就是匿名函数中所有路由的前缀，凡是在匿名函数中定义的路由，都会带上此前缀，路由组支持多层嵌套。

### ＃注释路由

注释路由仅在非生产环境下才会发挥作用，因为需要解析大量的注释，如果在生产环境下启用这种功能会造成大量的资源浪费，但可以通过命令对其进行缓存，该思路参考 Symfony 框架进行开发。

注释路由仅在控制器方法中才会生效，并且方法名要是 `Action` 结尾才能生效。

展开文件 `WelcomeBundle/Controllers/Index.php`

```php
namespace WelcomeBundle\Controllers;

use FastD\Framework\Bundle\Controllers\Controller;

/**
 * @Route("/welcomebundle")
 */
class Index extends Controller
{
    /**
     * @Route("/")
     */
    public function indexAction()
    {
        return $this->response('hello world');
    }
    // ...... some codes.
}
```

类名之上的注释就相当是路由组的功能，而方法上的注释则是具体的路由地址。参数与路由文件配置一样。

配置路由请求方法需要另加注释: `@Method("GET")` 里面参数是控制路由请求方法的值，默认不配置，路由则以 `any` 进行匹配。

当注释路由没有配置路由名字的时候，会将路由的路径地址作为路由名字进行保存，因为注意的是，尽量路由都配置一个名字，否则在动态路由中处理会比较麻烦。

完整配置: 

```php
/**
 * @Route("/", name="route.name", defaults={}, requirements={})
 * @Method("GET")
 */
```

**注释中字符串必须用双引号`"`，单引号无法解析，default、requirements 参数值必须是 json**

### ＃路由命令

如果这么多的路由不配套命令管理，那将是非常难以管理的。

#### ＃路由列表命令

```php
php bin/console route:dump
```

输出: 

```
Name                     Method         Scheme         Path
Bundle: WelcomeBundle\WelcomeBundle
/                        GET            http           /welcomebundle/
base                     GET            http           /base
base_post                POST           http           /base
dynamic                  GET            http           /{name}
user_profile             GET            http           /user/profile
```

将目前所有模块下的路由分别列出来，并按照模块划分。默认模块都在根下: `/`

通过路由命令以及路由的名字可以查询具体路由信息.

```
php bin/console route:dump base
```

输出: 

```
Route ["base"]
Path:           /base
Method:         GET
Format:         php
Callback:       WelcomeBundle\Controllers\Index@indexAction
Defaults:       
Requirements:   
Path-Regex:     /^\/base$/
```

查询到对应的正则匹配表达式，控制器已经方法等相关信息。

#### ＃路由缓存命令

```
php bin/console route:cache
```

命令会将所有的路由，不分模块地全部打包缓存到 `app/route.cache` 文件中，当在操作生产环境的时候，程序会自动读取 `route.cache` 文件而不再去重复读取每个模块下甚至是注释的路由配置，因此在生产环境下，必须先缓存一份路由列表。

也正因为生产环境需要缓存，才不会随意更新线上生产的环境代码。将损失降低，将发生损失的概率降低。
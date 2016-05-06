# 请求与响应

每个路由都包含一个控制器，而控制器当中就相当于接收一个请求，返回一个响应的结果，所以请求与响应此处和控制器密切相关。

### 请求 (Request)

如果需要在控制器中获取请求的信息，需要用到上一节的控制器依赖注入的模块功能。

```php
/**
 * @Route("/request", name="request")
 *
 * @param Request $request
 * @return Response
 */
public function requestAction(Request $request)
{
    return $this->response($request->getClientIp());
}
```

注入请求对象(FastD\Http\Request)之后, 即可通过对象获取对应的参数。具体可以通过请求对象查询更多的操作方法。

以上例子是获取请求来源的 ip 地址。

##### ＃get参数

get 参数也就是 URL 的 query string 参数，和 symfony 保持一致操作方式。

```php
$request->query->get($name);
```

如果 URL 为: `http://examples.com/?name=jan&age=18`

则可以通过 query 对象进行获取，例子: 

```php
$request->query->get('name'); // jan
```

如果要判断是否存在，则可以通过 has 方法进行判断，每个 `Attribute` 对象中都有该方法，具体可看源码.

```php
$request->query->has('name'); // bool true or false
```

两者也都可以结合，结合 has 和 get 方法进行判断获取，例子: 

```php
$request->query->hasGet('name', 'janhuang');
```

当如果没有找到 `name` 的时候，则会返回第二个参数作为默认值返回，也就是说，如果没有找到 `name` 则会返回 `janhuang` 作为结果。

##### ＃post参数

post 参数只是在对象上的不一样而已，其他操作和 get 操作保持一致，对象名与 symfony 保持一致。

```php
$request->request->get($name);
```

##### ＃cookie

##### ＃session

### 响应 (Response)


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
    return $this->response('hello response');
}
```

注入请求对象(FastD\Http\Request)之后, 即可通过对象获取对应的参数

##### ＃get参数

##### ＃post参数

##### ＃cookie

##### ＃session

### 响应 (Response)


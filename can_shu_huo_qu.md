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
    
是否不转义和不过滤，默认为 `false`，全部过滤，`true` 则不过滤
    
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

public function remove($name)
    {
        if ($this->has($name)) {
            unset($this->parameters[$name]);
        }

        return $this->has($name) ? false : true;
    }

    /**
     * @param $name
     * @param bool $raw
     * @param $callback
     * @return string|int|array
     */
    public function get($name, $raw = false, $callback = null)
    {
        if (!$this->has($name)) {
            throw new \InvalidArgumentException(sprintf('Attribute %s is undefined.', $name));
        }

        $parameter = $this->parameters[$name];

        if (!$raw) {
            $parameter = $this->raw($parameter);
        }

        if (is_callable($callback)) {
            $parameter = $callback($parameter);
        }

        return $parameter;
    }

    /**
     * @param $value
     * @return string
     */
    public function raw($value)
    {
        if (is_string($value)) {
            preg_replace('/(\<script.*?\>.*?<\/script.*?\>|\<i*frame.*?\>.*?\<\/i*frame.*?\>)/ui', '', $value);
            $value = strip_tags($value);
        }

        return $value;
    }

    /**
     * @param $name
     * @return bool
     */
    public function has($name)
    {
        return isset($this->parameters[$name]);
    }

    /**
     * @param            $name
     * @param            $default
     * @param bool|false $raw
     * @param null       $callback
     * @return array|int|string
     */
    public function hasGet($name, $default, $raw = false, $callback = null)
    {
        try {
            return $this->get($name, $raw, $callback);
        } catch (\Exception $e) {
            if (is_callable($callback)) {
                return $callback($default);
            }
            return $default;
        }
    }

    /**
     * @param $name
     * @param $value
     * @return $this
     */
    public function set($name, $value)
    {
        $this->parameters[$name] = $value;

        return $this;
    }

    /**
     * @return array
     */
    public function all()
    {
        return $this->parameters;
    }

    /**
     * @return bool
     */
    public function isEmpty()
    {
        return [] === $this->parameters;
    }

    /**
     * @return array
     */
    public function keys()
    {
        return array_keys($this->parameters);
    }

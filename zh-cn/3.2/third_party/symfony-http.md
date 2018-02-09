# Symfony HTTP Foundation

无论在 github 上，packagist上，都有大量的 HTTP 组件，fastd 自 3.2 开始已经开始支持 Symfony HTTP Foundation 组件。

使用该组件的朋友现在无需进行转换即可使用，包括 guzzlehttp 也能够无痕整合使用。

```php
<?php

namespace Controller;


use FastD\Http\ServerRequest;

class IndexController
{
    public function sayHello(ServerRequest $request)
    {
        return new \Symfony\Component\HttpFoundation\Response('hello');
    }
}
```

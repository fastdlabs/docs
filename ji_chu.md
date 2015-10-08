#视图入门

每个 Bundle 都分配一个资源目录，而资源目录则包含一个视图目录，而视图正是为响应图形界面而存在的。

使用模板渲染功能需要继承 `FastD\Framework\Events\TemplateEvent` 模板事件。

##TemplateEvent::render($template[, array $parameters = array()])

##说明

通过render方法渲染模板，render内部调用 `Twig` 引擎。

##参数

###template

模板文件路径，以 `src` 目录开头，支持所有包。

```
app/views/*
src/*
```

调用会根据路径像上述几个路径寻找。若没有文件，会抛出资源文件没有找到错误。

###parameters

需要传递到模板的参数，以数组 `key => value` 形式传递

##返回值 string

渲染模板并不会直接输出模板内容，而是会渲染模板文件，以最终显示的格式，把需要显示的全部文本信息全部返回，经过处理后，由 `FastD\Http\Response` 对象负责输出工作。

##范例

###Example #1 render() 示例

```php
use FastD\Http\Request;
use FastD\Framework\Events\TemplateEvent;

class Demo extends TemplateEvent
{
    public function demoAction(Reqeuest $request)
    {
        return $this->render('path/to/views.twig');
    }
}

Routes::get('/', 'Demo@demoAction');
```

参数传递: 

```php
use FastD\Http\Request;
use FastD\Framework\Events\TemplateEvent;

class Demo extends TemplateEvent
{
    public function demoAction(Reqeuest $request)
    {
        return $this->render('path/to/views.twig', [
            'name' => 'janhuang',
        ]);
    }
}

Routes::get('/', 'Demo@demoAction');
```





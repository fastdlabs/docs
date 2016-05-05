# 模板

FastD 中采用了 [Twig](http://twig.sensiolabs.org/) 来作为模板引擎。并且在 FastD 框架中已经实现对其进行自定义扩展的功能。

模板文件存放于目录: `{bundle}/Resources/views`

## 渲染模板

如果在试图目录下存在 `test.twig` 文件，那么只需要在控制器中调用 `render` 方法即可对其进行渲染，减少 1.x 版本中过长的模板路径

```php

```
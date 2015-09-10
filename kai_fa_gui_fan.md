#开发规范

`FastD` 推崇自由，灵活及模块包的形式去进行开发，降低项目依赖并提供灵活性，而且框架遵循 `PSR-4` 加载规范，所以建议在使用框架开发的时候顺便也了解并熟悉 `composer`，因为框架本身也适用 `composer` 进行依赖管理。

对于命名，其实我一直都苦恼这个问题，有时候程序开发并不是难题，命名这里才是难题呀。我曾经见过很多的命名是: `$a1`, `$b2`, 相信大家也不陌生，估计会气死很多人。而且有时候呢，会发现命名风格不一样，所以结合经验，我推荐几个自己的命名方式。



####类命名

驼峰(这里均指对象/类)， 而结尾呢，统一使用 `.php`。 如:

```
Demo  => Demo.php

DateConvert => DateConvert.php
```

####接口

```
DemoInterface  => DemoInterface.php

DateConvertInterface => DateConvertInterface.php
```

####抽象

```
DemoAbstract  => DemoAbstract.php

DateConvertAbstract => DateConvertAbstract.php
```

####类常量,常量

统一全部大写，并使用下划线隔开单词，如： 

```
define(DATE_CONVERT, ''); 建议少用

const DATE_CONVERT
```


# 模块

在框架中，模块我们称之为 **bundle**，其实就是与其它框架中的模块是一样的，因为框架中 `bundle` 更像是一个独立的单元，而每个独立的单元都是可以独立运行，互不依赖的。

### ＃构建 bundle

框架提供快捷的构建 `bundle` 方法，我们可以通过命令快速生成一个空白的 bundle.

```php
php bin/console bundle:generate
```

创建 bundle 骨架。

bundle 目录结构如下:

```php
Commands
Controllers
Exceptions
Extensions
```
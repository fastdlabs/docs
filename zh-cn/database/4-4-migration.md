# 数据迁移

3.2 版本提供更加完善的数据迁移功能，实现自: [fastd/migration](https://github.com/JanHuang/migration) 组件

### 基础使用

migration 组件提供易用的命令行工具，通过终端窗口可以快速使用。

##### info 命令

该命令会列出所有存在数据库当中的表，通过终端进行显示

```php
$ php bin/console migrate info
```

通过添加表名，查看详细的数据表结构。

```php
$ php bin/console migrate info table
```

##### dump 命令

dump 命令用于将数据表结构导出，转换成 seed 表结构，可以用于导出本地数据库结构，然后提交代码，用于其他人在代码合并和更新的时候使用。

```php
$ php bin/console migrate dump
```

导出指定表结构

```php
$ php bin/console migrate dump table
```

##### seed

创建 seed 种子文件。

```php
$ php bin/console migrate seed table
```

创建的结构如下:

```php
<?php

use \FastD\Migration\MigrationAbstract;
use \FastD\Migration\Table;


class {Table} extends MigrationAbstract
{
    /**
     * {@inheritdoc}
     */
    public function setUp()
    {
        $table = new Table('hello');

        $table
            // some code
        ;

        return $table;
    }
}
```

##### run

执行 seed 文件并自动填充数据，数据方面可以用于预定义测试数据，这样有利于加速应用测试。

```php
$ php bin/console migrate run
```

运行指定表。

```php
$ php bin/console migrate run table
```

##### cache

缓存处理操作，用于查看和清理缓存数据，不影响业务处理。

```php
$ php bin/console migrate cache
```

清除缓存

```php
$ php bin/console migrate cache --clear
```

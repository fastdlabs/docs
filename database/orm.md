# ORM

ORM 是框架 2.x 版本新增的一个特性，其中 ORM 实现对象模型映射，模型间的关系映射暂时并不支持，并且会考虑到性能方面的问题，未来也不一定会加入的新特性当中，因此目前版本 ORM 是仅对简单操作进行一个封装，并不支持完善复杂的关系模型映射，敬请原谅。

### ＃基本用法

ORM 的生成建议依赖于命令行，当然如果手动建立也是可以的，但是这样子重复性的工作就会比较多，所以我一般建议，如果可以自动化处理的，那就直接自动化处理，然后再经过自己又话就好了，省掉多余的时间。

此处 ORM 有个好处就是，可以根据已有的数据库声称对应的对象文件，省掉大部分不必要浪费的时间。

##### ＃ORM 命令

系统中默认提供两个操作命令

```php
php bin/console
```

输出: 

```php
...
orm:
 ➜ orm:revert
 ➜ orm:update
...
```

`orm:revert` 是通过已存在的数据库反射出关系对象。

`orm:update` 是通过自己定义的数据表，进行自动生成表结构和数据表关系对象。

因此两者仅是一个流程顺序的关系。

**数据库操作命令不应该在生产环境之行**

##### ＃orm:update

`orm:update` 前提需要建立数据库 `yml` 配置文件，命令通过已经存在的配置文件，创建数据表已经关系对象，每一个配置文件代表一个数据表。

配置目录: `{bundle/Resources/orm}`

命令参数: 

```php
php bin/console orm:update \
   {connection:要执行的数据库连接} \
   {--create:是否创建数据表} \
   {--bundle:模块包} \
   {debug:是否debug模式}
```

建立数据表配置文件: 

```yml
table: demo
prefix: fd_
suffix: ''
engine: innodb
charset: utf8
fields:
    id:
        name: id
        type: int
        length: 10
        default: 0
        comment: ''
        unsigned: false
        key: ''
        nullable: false
```

目前数据表配置仅支持 `yml` 格式，因为 `yml` 格式文件直观，可以一目了然，所以在配置文件上是一个绝佳的选择，但是要考虑性能的问题，不能滥用，因为命令执行在 CLI 模式下，因此不需要考虑性能问题。

＃表名(必填): 

```yml
table: demo
```

＃前缀: 

```yml
prefix: fd_ # 默认留空
```

＃后缀: 

```yml
suffix: # 默认留空
```

＃存储引擎:

```yml
engine: innodb # 默认是 InnoDB
```

＃存储编码:

```yml
charset: utf8 # 默认是 utf8
```

字段设置以数组形势进行配置，因为有多个字段，而且字段的 `key` 是字段的别名，并且在 ORM 查询的时候，会默认以别名方式进行查询，以确保数据表字段名不回暴露给外部。

```yml
fields:
    id:
        name: id
        type: int
        length: 10
        default: 0
        comment: ''
        unsigned: false
        key: ''
        nullable: false
```

＃字段详细解析

```yml
name: id # 数据表字段名
type: int # 数据字段类型
length: 10 # 字段长度
default: 0 # 默认值
comment: '' # 注释，说明
unsigned: false # 是否允许为负数
key: '' # 数据库字段索引 索引目前支持3种 UNIQUE、PRIMARY、INDEX
nullable: false # 是否允许为空，默认不允许为空
```

配置完成后，执行命令: 

```php
php bin/console orm:update write --create --debug
```

输出:

```
CREATE TABLE `fd_demo` (
`id` int(10) NOT NULL DEFAULT 0, 
KEY `index_id` (`id`)
) ENGINE=innodb CHARSET=utf8;

Building from bundle:   WelcomeBundle\WelcomeBundle     ["Resources/orm"]

```

命令最重会生成一个目录，

开启 debug 模式后，执行的语句会在终端显示，用于查看具体语句是否正确。

当选项 `--create` 存在时，才会执行对应的新建表操作。否责会执行表更新操作。

此时制定的数据库连接当中则会建立对应的数据表，数据表结构和打印出来的数据表结构是保持一致的。

##### ＃orm:revert

如果你的数据库当中已经存在对应的数据表，但是又不想手动添加文件，那么这个时候，命令 `orm:revert` 就可以帮助到你，减少这一个重复的操作。

例如已经存在的数据库 `test` 中存在 `test, fd_demo` 两个数据表，执行命令: 

```php
php bin/console orm:revert read
```

##### ＃对象关系模型
# ORM

ORM 是框架 2.x 版本新增的一个新特性，其中 ORM 实现对象模型映射，模型间的关系映射暂时并不支持，并且会考虑到性能方面的问题，未来也不一定会加入的新特性当中，因此目前版本 ORM 是仅对简单操作进行一个封装，并不支持完善复杂的关系模型映射，敬请原谅。

### ＃基本用法

ORM 的生成建议依赖于命令行，当然如果手动建立也是可以的，但是这样子重复性的工作就会比较多，所以我一般建议，如果可以自动化处理的，那就直接自动化处理，然后再经过自己又话就好了，省掉多余的时间。

此处 ORM 有个好处就是，可以根据已有的数据库声称对应的对象文件，省掉大部分不必要浪费的时间。

##### ＃ORM 命令

系统中默认提供两个操作命令，命令最重会生成一个 `ORM` 目录，目录中按照数据库区分不同的对象模型。

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

开启 debug 模式后，执行的语句会在终端显示，用于查看具体语句是否正确。

当选项 `--create` 存在时，才会执行对应的新建表操作。否责会执行表更新操作。

此时制定的数据库连接当中则会建立对应的数据表，数据表结构和打印出来的数据表结构是保持一致的。

##### ＃orm:revert

如果你的数据库当中已经存在对应的数据表，但是又不想手动添加文件，那么这个时候，命令 `orm:revert` 就可以帮助到你，减少这一个重复的操作。

例如已经存在的数据库 `test` 中存在 `test, fd_demo` 两个数据表，执行命令: 

```php
php bin/console orm:revert read
```

命令与生成更新的命令一只，在流程上仅在解析 `yml` 和生成 `yml` 的却别，最重命令生成对象关系模型于 `ORM` 目录中。

```php
Generate into bundle: Welcome\WelcomeBundle\Orm
```

如果在数据库配置中没有配置前缀，那么数据表表名是会完全全名提取，不会区分前缀、后缀和表名之间的区别。

**命令会覆盖字段方法，用户自定义方法不会覆盖，所以在Entity/Repository生成后自定义方法是比较推荐的**

### ＃对象关系模型

对象关系的新建方法有两种，建议使用命令进行生成，因为命令生成的对象可以有一个统一的处理方式，在系统生成完成的对象模型中，加入自己的自定义方法，在处理方式上更为灵活，便捷。

##### ＃Entity 表实体

每一个数据表的每一行数据对应一个 Entity 实体，所以 Entity 在理解上，可以理解为一行数据记录，因此在数据处理上应该明确确认模型与记录的区别。

Entity 实体在构造的时候接受两个参数，一个是查询条件，第二个是数据库连接驱动，操作需要在制定的数据库连接驱动上执行。

实体对象在参数 (null) 的时候需要执行的是 `save` 方法，而不是查询方法。`save` 方法会自动根据查询条件，更新的内容执行 `insert` 或者 `update` 操作。

##### ＃新增记录

```php
$demo = new Demo(null, $this->getDriver('write'));
$demo->setId('1');
```

##### ＃更新记录

```php
$demo = new Demo(['id' => 1], $this->getDriver('write'));
$demo->setId('5');
```

##### ＃查询记录

```php
$demo = new Demo(['id' => 1], $this->getDriver('write'));
$demo->getId(); // 1
```

Entity 对象实体可以大量减轻 <u>**简单**</u> 的数据表操作。

##### ＃Repository 模型

Entity 看作是行记录，那么 Repository 就可以看做是表模型对象了，因为 Repository 正是用于操作整个表的。

Repository 在生成之后是一个空白的对象，内部仅有预定义的基类方法，剩下的均有自己定义，这就是为什么推荐使用自动生成，手动定义的方式进行处理的原因。

其中 Repository 的操作可以参考 [数据库:入门](ru_men.md)

##### ＃字段映射

在处理 Entity、Repository，相信大家会发现两个对象当中会有多个类常量定义，而类常量的定义刚好是另外一个对象的常量，那么这个对象，也就是程序自动生成的数据表字段。因此除了在 Entity、Repository 中使用，还可以在其他地方进行调用。

##### ＃参数绑定

数据对象模型支持数据绑定，其实就是参数自动完成功能。

```php
\FastD\Database\Orm\Entity::bindRequest(\FastD\Http\Request $request);
```

传递 `\FastD\Http\Request` 对象，程序自动判断请求方法，进行参数绑定。

其内部原理就是一个 `foreach` 循环。

源码: 

```php
public function bindRequest(Request $request)
{
    return $this->bindParams(
        $request->isMethod('get') ? $request->query->all() : $request->request->all()
    );
}
```

`binRequest` 获取请求参数后，调用 `bindParams` 方法进行参数 "赋值"，完整整个参数绑定流程。

```php
public function bindParams(array $params)
{
    if (array() === $params) {
        throw new \Exception("Request params error.");
    }

    foreach ($params as $name => $value) {
        if (array_key_exists($name, static::FIELDS)) {
            $field = static::FIELDS[$name];
            // for entity
            $method = 'set' . ucfirst($name);
            if (method_exists($this, $method)) {
                $this->$method($value);
            }
            // for repository
            $this->data[$field['name']] = ':' . $name;
            $this->params[$name] = $value;
        }
    }
}
```


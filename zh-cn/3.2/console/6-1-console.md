### config 命令

用于查看 config 配置文件信息，会以 json 格式化输出到终端，可用于 QConf 配置中心调试。

```php
$ php bin/console config
```

查看指定配置文件信息

```php
$ php bin/console config app
```

### controller 命令

用于创建初始化控制器。

```php
$ php bin/console controller Demo
```

### model 命令

用于创建初始化数据操作模型。

```php
$ php bin/console model Demo
```

### migrate 命令

执行数据迁移命令。详情可查看: [数据迁移](zh-cn/3.2/database/4-4-migration.md)

### route 命令

查看调试所有路由，展示路由列表及详情

```php
$ php bin/console route
```

### process 命令

用于管理进程，当我们编写好进程处理逻辑之后，可以通过该命令进行管理。详细操作可看: [进程管理](zh-cn/3.2/process/7-1-swoole-processor)

```php
$ php bin/console process name
```

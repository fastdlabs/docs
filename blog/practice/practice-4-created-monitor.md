### 原有监控系统
![Alt text](https://runnerlee.com/assets/img/2017-08-18/graphite.png)

整个系统以 Graphite (carbon + whisper) 为核心, kong 通过 [statsd plugin](https://getkong.org/plugins/statsd/) 将服务调用信息发送至 [statsd](https://github.com/etsy/statsd), 而 statsd 则将统计信息通过 Web API 保存至[Graphite](https://graphiteapp.org/) . 最终在 [Grafana](https://grafana.com/) 中通过 [Graphite Data Source](https://grafana.com/plugins/graphite) 获取统计信息并输出图表到面板.  

这是网上找到的, 对 Grafana 的描述
> Grafana 是一个开源的指标量监测和可视化工具。常用于展示基础设施的时序数据和应用程序运行分析。Grafana 的 dashboard 展示非常炫酷，绝对是运维提升逼格的一大利器。<br>grafana 的套路基本上跟 kibana 差不多，都是根据查询条件设置聚合规则，在合适的图表上进行展示，多个图表共同组建成一个 dashboard，熟悉 kibana 的用户应该可以非常容易上手。另外 grafana 的可视化功能比 kibana 强得多，而且 4 以上版本将集成报警功能。

在之前的监控中, 只能统计到 kong 的调用信息, 整个结构的复杂度高, 而实现的功能却比较简单. 搞了这么大一套鬼东西,  只能查看 kong 的监控. 虽然能通过 [Zabbix Plugin](https://grafana.com/plugins/alexanderzobnin-zabbix-app) 在 Grafana 中查看 zabbix 的监控数据, 但是支持度有限, zabbix 的性能也... 叔恶死 ...


### 迭代
开源的时序性数据库不多, 其中比较出名的有 Graphite 跟 influxdb.

这是维基百科上对 influxdb 的介绍
> InfluxDB 是一个由 InfluxData 开发的开源时序型数据库[note 1]。它由 Go 写成，着力于高性能地查询与存储时序型数据。InfluxDB 被广泛应用于存储系统的监控数据，IoT 行业的实时数据等场景。

通过了解, influxdb 相比 Graphite 有这些优势:
* 提供 telegraf 作为 agent 采集服务器信息, 并有非常丰富的插件用户采集 Nginx/Redis/PHPFPM/Elasticsearch 等的状态信息. 真正提供了采集/存储/可视化, 屌屌屌.
* 可扩展能力 (待实践)
* 方便而强大的查询语言
* 高效存储 (待验证)

而其中, Telegraf 也提供了 Statsd Server 功能, 解决了 Statsd 官方推荐的 [influxdb backend 插件只支持 influxdb 0.9 的情况](https://github.com/bernd/statsd-influxdb-backend/issues/37) .

### 基于 Influxdb + Telegraf + Grafana 搭建的监控系统
![Alt text](https://runnerlee.com/assets/img/2017-08-18/influxdb.png)

在这一版的监控系统中, 我们将利用 Telegraf 或者直接提交至 Influxdb, 来采集三种信息:
* 在每台机器上安装 Telegraf 用于采集服务器及其安装的软件的状态和统计信息
* 在网关所处的机器上, 启用 Telegraf 提供的 Statsd Server 功能, 在 Kong 中, 启用 Statsd 插件, 将调用日志提交至 Statsd.
* 在服务中创建计划任务定时提交业务数据提交至 Influxdb

Influxdb 提供了一个 Web API 用于管理, 类似于 Mysql, Influxdb 也提供了 命令行的 Client 用于管理.

同时, 需要部署 Grafana 用于可视化面板. 部署 [Chronograf](https://docs.influxdata.com/chronograf/v1.3/) 用于管理 Influxdb. Chronograf 提供了 Influxdb 的 Web Admin 功能(在 Influxdb 0.9时代是内置在 Influxdb中的), 以及比较丰富的图表功能, 但是不能跟 Grafana 比. 因此我们只把它用来管理 Influxdb.

### Telegraf

telegraf 内置了很多 `Input Plugin`, 用途是什么呢?
回想到如果是你自己去做一个监控, 能够做到记录每分钟 CPU 的空闲率是多少, 要怎么做?

- 搞一个数据库, 用来放数据的
- 写一个脚本, 用来获取 CPU 的相关数据, 加上时间戳, 然后保存到数据库
- 创建一个定时任务, 一分钟运行一次脚本
- 写一个简单的程序, 从数据库查到数据, 然后根据时间戳, 绘制成图表.

在你的脚本里面, 你可以采集任何你采集得到的数据, 然后怼到数据库. 而 `Input Plugin` 就是写好了的脚本. 只需要在配置文件中开启, 就可以采集到对应的数据. telegraf 内置的 `Input Plugin` 有这些:

- Nginx
- MySQL
- PHP FPM
- redis
- Net
- Netstat
- MongoDB
- PostgreSQL
- Zipkin
- Zookeeper
- Elasticsearch
- Apache
- Docker
- ...

oh shit! 我要的都有!

而且, 前面讲到, telegraf 内置了一个 Statsd Server ([Service Inputs](https://docs.influxdata.com/telegraf/v1.4/services/)), 从而解决了 Kong 调用监控的问题. 然而这不是全部, telegraf 还提供了:

- HTTP Listener
- TCP Listener
- UDP Listener
- Webhooks Listener

shit..

这只是 `Input`, Output 还支持 `Graphite`, `Elasticsearch`, `Datadog` 等等.. shit..


### 安装部署
需要准备一台机器用于安装数据库及 UI. 安装完成后启动服务, 并在需要监控的每台机器上安装 agent. 根据需要配置好 `input plugin`.

每个 `telegraf` 只能提交到一个 `database`. telegraf 的每个 `input` 项都会有一个 `host` 的 `tag`, 它的值默认是机器的 `hostname`, 可以在 telegraf 的配置文件中修改.

根据资源编排, 以及 Grafana 的面板模板变量, 将机器与数据库的关系定位:
- 以每台机的 IP 作为 `hostname`, 或是以 `{分组名}+{组内编号}`.
- 一个分组一个数据库
- 根据分组需要开启 `input plugin`
- 固定一个台机采集所有 mysql, redis 等服务

好了, 那么开工!

#### 安装 Influxdb
```
cd /usr/local/src
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.3.2.x86_64.rpm
yum localinstall influxdb-1.3.2.x86_64.rpm

# 启动
/etc/init.d/influxdb start

# 检查 8086 端口
curl -i 'http://127.0.0.1:8086'
```

#### 安装 Chronograf
```
cd /usr/local/src
wget https://dl.influxdata.com/chronograf/releases/chronograf-1.3.6.1.x86_64.rpm
yum localinstall chronograf-1.3.6.1.x86_64.rpm

# 启动
/etc/init.d/chronograf start

# 检查 8888 端口
curl -i 'http://127.0.0.1:8888'
```
如果 `8888` 已被占用, 需要指定端口运行
```
nohup chronograf --port=8889 > /dev/null 2>&1 &
```

#### 安装 Grafana
```
cd /usr/local/src
wget https://s3-us-west-2.amazonaws.com/grafana-releases/release/grafana-4.4.3-1.x86_64.rpm
yum localinstall grafana-4.4.3-1.x86_64.rpm

# 启动
/etc/init.d/grafana-server start

# 检查 3000 端口
curl -i 'http://127.0.0.1:3000'
```

#### 安装 Telegraf
需要在每一台机器上安装 Telegraf 作为 agent, 采集跟上报数据到 Influxdb. 包括安装 Influxdb 的机器
```
cd /usr/local/src
wget https://dl.influxdata.com/telegraf/releases/telegraf-1.3.5-1.x86_64.rpm
yum localinstall telegraf-1.3.5-1.x86_64.rpm
```

安装完成后, 默认配置已经有采集系统信息的了, 需要增加几项 `input`

##### database
如果配置的 `database` 不存在, 将自动创建.
```
[[outputs.influxdb]]
  urls = ["http://10.1.0.1:8086"]
  database = "servers_xxxx"
  retention_policy = ""
  write_consistency = "any"
  timeout = "5s"
```

##### nginx
需要在 nginx 上启用 status, 我们固定使用 1200 端口.
```
server {
    listen  *:1200 default_server;
    server_name _;
    location /nginx_status
    {
        stub_status on;
        access_log off;
    }
}
```

然后修改 `/etc/telegraf/telegraf.conf`
```
 [[inputs.nginx]]
   urls = ["http://127.0.0.1:1200/nginx_status"]
```

##### PHP FPM
需要启用 fpm 的status
```
pm.status_path = /status
```

然后修改 `/etc/telegraf/telegraf.conf`
```
 [[inputs.phpfpm]]
   urls = ["fcgi://127.0.0.1:7006/status"]
```

##### Net
```
 [[inputs.net]]
    interfaces = ["eth0", "eth1"]
```

##### Netstat
```
 [[inputs.netstat]]
```

配置完成后, 需要对配置进行测试, 完成后启动再启动
```
telegraf -config /etc/telegraf/telegraf.conf -test

/etc/init.d/telegraf start
```


### 配置 Grafana 面板
在 Grafana 中, 需要先配置数据源 (Data Source), 然后创建 Dashboard, 在 Dashboard 中创建 Panel 也就是各种统计组件. 最终完成一个面板的配置.

#### 配置数据源
![Alt text](https://runnerlee.com/assets/img/2017-08-18/data_source.png)
配置数据源需要注意几个地方:
* type, 选择 Influxdb,
* name, 固定 `server_{name}`
* url, Influxdb 的地址
* access, 固定 proxy. 此外还有 direct. 前者是经由 Grafana 所在机器代理访问 Influxdb, 后者是在浏览器直接访问 Influxdb.
* database, 目标机器的 Telegraf 做配置的 database

配置完成后, 点及 `Add` 两次, 如果显示 `test success` 即为成功.

#### 创建面板
![Alt text](https://runnerlee.com/assets/img/2017-08-18/new_dashboard_action.png)
![Alt text](https://runnerlee.com/assets/img/2017-08-18/new_panel.png)
![Alt text](https://runnerlee.com/assets/img/2017-08-18/edit_panel.png)

可以选择切换到手动编辑  SQL 模式.
![Alt text](https://runnerlee.com/assets/img/2017-08-18/edit_sql.png)

然后保存, 这样就创建好了第一个面板了.

### 查询语言
具体需要查看[官方文档](https://docs.influxdata.com/influxdb/v1.3/query_language/)

Influxdb 使用的查询语言是一种类 SQL 的查询语言

> InfluxDB’s SQL-like query language for interacting with data in InfluxDB.

Influxdb 是一种时序型的数据库, 跟关系型数据库(以 mysql 为例)的区别, 我理解就是数据库自动维护着 `created_at`

#### 结构的异同
* 都有 database, 并且都需要创建才能使用
* mysql 有 table, Influxdb 有 measurement, 两者的角色差不多
* measurement 下有 tag, tag 下才是 field.
* measurement + tag = serie

#### 查询语句的异同
* CRUD 中 Influxdb 只有 C R D
* Influxdb 对正则表达式的支持. 例如 `SELECT "value" FROM /kong_sms_request_status_*/`
* tag 跟 field 都可以用于 where 查询
* Influxdb 有更丰富的聚合查询

当然, 两种类型的数据库的主要用途不同, 对比只是用于方便上手, 并非对比两者优劣.

##### 示例
```
> create database "demo"

> show databases
name: databases
name
----
_internal
demo

> use "demo"
Using database demo

> insert hello,tag_alpha=2 value=3
> insert hello,tag_alpha=2 value=3
> insert hello,tag_alpha=4 value=5
> insert hello,tag_alpha=4 value=6
> show measurements;
name: measurements
name
----
hello

> select * from hello
name: hello
time                tag_alpha value
----                --------- -----
1503037127485600991 3         3
1503037249575451262 2         4
1503037384953683603 4         5
1503037626342109770 4         6

> select * from hello where tag_alpha='2'
name: hello
time                tag_alpha value
----                --------- -----
1503037249575451262 2         4

> select * from hello where tag_alpha='4' and value=6
name: hello
time                tag_alpha value
----                --------- -----
1503037626342109770 4         6
```

### 效果
给一张公司内部署之后的面板图
![Alt text](https://runnerlee.com/assets/img/2017-09-08/2017-09-08-14-55-115.29.5.144-3000.png)

#### 友情链接

[RunnerLee](https://runnerlee.com/2017/08/28/grafana-dashboard-config): fastD 贡献者之一
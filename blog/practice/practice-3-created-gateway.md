构建完成 API 服务，配置中心之后，架构图大致如下:

![](http://fastdlabs.com/storage/QQ20170810-120757%402x.png)

#### 我们为何需要网关

引用 [别人](https://mp.weixin.qq.com/s/XTzRr0eR6ybpNFGJ57cVkA) 的一句话:

> 我们总是听到编排这个词，所以我喜欢这张幻灯片 – 它展示了一个乐队，然后有个指挥家，下面一堆人（微型服务）演奏自己的乐器。这个指挥家（API网关）可以以某种方式来协调我们的架构如何处理请求。

我们需要将业务或服务放置在网关背后，由网关统一处理请求入口，本身由多个入口的处理变成了一个入口，由网关进行统一调度。

> 有一个很nice的事情，就是API网关让我们的客户端不用再需要知道和关心模块的地址（address）了。网关负责来搞这些事情，你只需要知道网关就好了。你可以去改变实现而且还可以改变API接口。不过通常来说，你改变接口后，会增加客户端出问题的风险。

还有很多有趣的功能，有兴趣的朋友可以参考:

1. [微服务与API 网关（上）: 为什么需要API网关？](https://mp.weixin.qq.com/s/XTzRr0eR6ybpNFGJ57cVkA)
2. [微服务与API 网关（下）: Kong能为我们做什么？](https://mp.weixin.qq.com/s/Woktbld0-7bd73ySmVA3ug)

#### 构建

由于本人使用 ubuntu 虚拟机，所以此处只介绍 ubuntu 下的安装，其他安装方式可参考: [kong installation](https://getkong.org/install/)

##### 安装 postgresql

```
sudo add-apt-repository "deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main"
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-9.6
```

安装 postgresql 完成后，初始化数据库:

```
su postgres
psql
CREATE USER kong; CREATE DATABASE kong OWNER kong;
```

`ctrl + D` 退出

##### 安装 kong

```
$ sudo apt-get update
$ sudo apt-get install openssl libpcre3 procps perl
$ sudo dpkg -i kong-0.10.3.*.deb

```

```
$ kong start

# Kong is running
$ curl 127.0.0.1:8001
```

这个过程可能会出现: `[postgres error] FATAL: password authentication failed for user "kong"`

查看 pgsql 配置文件所在位置，因为我是 `apt-get install` 的，因此，存储位置在 `/etc/postgresql/9.6/`

修改 `/etc/postgresql/9.6/main/pg_hba.conf` 文件，找到IPv4 配置项，约92行，修改

```
host    all             all             127.0.0.1/32            md5

=>

host    all             all             127.0.0.1/32            trust
```

重新启动即可。

```
$ sudo kong start
```

#### 整合 FastD API


##### 1. 添加 API 到网关

```curl
curl -i -X POST \
  http://127.0.0.1:8001/apis/ \
  --data 'name=example-fastd' \
  --data 'hosts=fastd.com' \
  --data 'upstream_url=http://127.0.0.1:9527'
```

添加 API Server 到网关，成果会返回 201 状态吗表示创建成功 (Created)

##### 2. 检查 API 状态

获取列表: `http://127.0.0.1:8001/apis/`

发起请求.

```curl
curl -i -X GET \
  --url http://127.0.0.1:8000/ \
  --header 'Host: fastd.com'
```

此时此刻你会发现已经成功使用 kong 对其进行代理，至此之外，已经完成了基本的网关接入。最终架构图如下:

![QQ20170815 174158%402x](storage/QQ20170815-174158%402x.png)

#### 插件

kong 提供的插件非常丰富，因为也是基于 lua 的，因此你可以使用 openresty 对其进行扩展，开发更加贴近业务的应用。

插件文档: [点击](https://getkong.org/docs/0.10.x/admin-api/#plugin-object)

更多可看 kong 官方文档。

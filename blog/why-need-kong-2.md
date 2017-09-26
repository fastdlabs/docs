![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSMF177ugIOYpWz4QBvg8zPWYOsGOOarldNsEqgib7Pn5E3j58D1WD0Mw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

本系列内容是来自Mashape.com的Marco在nginx.conf上的一次演讲。

上一集我们介绍了为什么我们需要API网关：[微服务与API 网关（上）: 为什么需要API网关？](https://fastdlabs.com/blog/7)

本系列第一部分（上集）主要介绍了单体和微服务之间的差别，以及为什么我们需要一个API网关等等。

本系列的第二部分（也就是本集）主要关注Mashape.com的API网关，Kong，这个框架。我们来看看怎么使用这个框架。

ok，开始吧。

### 目录

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzS0EvlSm8TJjD3UNeLf7Mpicwx9JicrcbkhuRpCPiaS6VCibibibFXhKqG1mHQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

#### API网关和Kong能为你做些什么（API Gateways and Kong Can Help）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSyxp6Rl5BKlVYt1SX8GicKJc367ibATFPJU5ne9HvbrCXkvBaUmWaR0Ew/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)


API 网关可以通过实现一些中间件来解决一些问题，这些中间件的功能你就不用再到每个service中实现了。你也是知道的，不同的团队使用不同的方式来实现了不同的微服务。

如果你不去做一些中心化和抽象化的事情，你将会死于不同的认证方式以及不同的速率限制实现，五花八门。你肯定希望避免这样的糟糕局面。

API网关不仅可以帮你解决API的管理部分，而且还可以解决下面两件事情：

**分析（Analytics）** –  API网关可以和你的分析基础设施保持透明的交互和通信，因为API网关是每个请求（request）的入口，必经地。API网关可以看到所有的数据，可以知道经过你的service的流量。这就相当于你有一个集中的地方，你可以把所有的这些信息push到你的监控或分析工具，比如Kibana或者Splunk。
**自动化（Automation）** –网关还有助于自动化部署，还可以帮助你实现自动化登入验证（on boarding）。 什么是登入（on boarding）呢？ 如果你有API，并且你希望有身份验证，你可能需要一些功能可以允许用户为该API创建登入凭据（credentials）然后开始使用（消费）API。 开发人员门户网站或你的文档中心等都可以与网关集成来配置这些凭据（credentials），这样你就不用从头开始构建一些功能了。

#### What is Kong?

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSC1DzQcyDE9o3kS0rqX5yFs2niaotZhn3bnVpiaosY1icSibw2Md1ic4aL3g/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

那么，Kong是一个什么东东呢？它是一个开源的API网关，或者你可以认为它是一个针对API的一个管理工具。你可以在那些上游service之上，额外去实现一些功能。Kong是开源的，所以你可以在Github找到它，你现在就可以下载使用。

#### Kong能为我们做什么？（What Does Kong Do?）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzS30JnGnIAQPLRJzWmIIIIEE7WrD8JdexlmKdvv3gZwD9s5Ify28jJyw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

你可以通过Kong把所有的通用功能集中到了一个地方。就像我之前说的那样，碎片散落在很多个不同的service里，针对一个重复（通用）的功能实现了不同的版本，糟糕至极。

API网关（比如Kong）可以把所有的这些都集中到一个地方，这就让service的开发变得更加的轻松简单，你只需要安心的关注和业务紧相关的事情。

#### Kong的一些插件（Kong Plug‑ins）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzShib9ibt7UUVp1Hkn95XibrMFgZNathZEw0Vf3neq9Il2FrcZqIPkZUPibw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

插件是个什么概念呢？Plugins。插件其实就是Kong提供的一些中间件，你可以添加到这些上游的service之上。这些插件可以是安全认证（authentication）、流量控制（traffic control）、日志（logging）或者是其他转换功能。

假设你现在有一个SOAP service，你想要暴露一个RESTful接口。API网关比如Kong就可以实现这样的转换。你不需要告诉你的团队去改变API的实现来做这样的转换。API网关可以为你实现这样的转换。

#### Kong = OpenResty +NGINX

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSu74Fo2XicDqn3SNTIvmFDPc914ubKGjsR4M7wjz7drGafE89g1O8yLg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

从技术的角度讲，Kong可以认为是一个OpenResty应用程序。 你知道，OpenResty运行在NGINX之上，使用Lua扩展了NGINX。 Lua是一种非常容易使用的脚本语言，可以让你在NGINX中编写一些可以执行的操作。

OpenResty针对一次API 请求-响应（request‑and‑response） 生命周期中的不同的事件提供了钩子，所以你可以编写Lua脚本代码，然后把这些代码挂载到那些事件上-比如，一个新的请求（request）正在进入的时候，一个新的请求（request）将要被代理的时候，一个响应返回了的时候。你可以为每个事件编写定制的代码而且你还可以动态的改变请求的内容（requests）和响应的内容（responses）。

【在架构上】我们底层是使用NGINX为Kong提供底层的支持。所有的代理都是由NGINX来完成-这是一个非常强大的能力。而OpenResty则是Kong的核心的核心。它通过这些新功能扩展了NGINX，而在这两种技术之上，Kong实现了集群(clustering)，插件(plugins)和可用于管理API网关的RESTful API。

像Elasticsearch，你就可以通过API来做一些和数据库有关的你想要做的事情，Kong也暴露了API，你完全可以通过这些API去操作到Kong的内部，只需要发送一次HTTP调用，然后把响应回来的JSON解析就可以使用了。

这意味着你可以集成Kong到这个链接中（[https://www.nginx.com/resources/glossary/devops/](https://www.nginx.com/resources/glossary/devops/)）Devops以及自动化工具中去。你也可以集成Kong到第三方service中去，以及一些开发者门户（developer portals）以及其他一些入口工具中。Kong支持把所有的信息保存到PostgreSQL或者Cassandra，当然这取决于你要哪一种存储方案。

Cassandra是最终一致的数据库。 这意味着如果你有一个由多个节点组成的Cassandra集群，你存储数据的话，则最终该数据将传播到所有其他节点 – 但不是同时[或“立即”]到达每个节点。

Ok，假设现在一个三节点的Cassandra集群位于DC[data center]1，另一个三节点的Cassandra集群位于DC2，然后你把这两个集群又连接到了一起，保持同步。这种情况下，你在一个数据中心做的任何操作最终都会被复制到另外那个数据中心去。

PostgreSQL使用起来更加简单。它支持master和slave，但不支持跨DC的多数据中心复制（就是不支持那种masterless架构）。不过，也有一些工具可以帮你实现跨数据中心复制。

#### NGINX 配置（Configuration）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSFkt2G0FWxePSQJswfhNZVIiawWZ4IfUF7ib5pbEMmjXYxxqsRoS7IibLw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

由于Kong是建立在NGINX之上的，所以你可以访问到Kong上的NGINX的配置，而且还可以轻松替换现有的NGINX的一些实现，并且还依然能在Kong上运行那些老的功能。

这就它的工作原理：我们有NGINX的配置，然后我们可以修改。

然后，Kong自带的配置可以包含在NGINX配置内。

在Kong的配置中，它会使用一些OpenResty的指令，比如… access_by_lua_block and header_filter_by_lua这些。

当你创建了一个基于Kong的插件，你都可以挂载到在请求-响应一个生命周期中的那些事件上。

Kong也支持一些商业插件以及Mashape已经构建好的一些插件。这些可用的插件你也可以在getkong.com中找到，或者去github仓库里也有。此外，社区一些人也使用他们自己的插件扩展了Kong。

如果你在GitHub上搜索“Kong plug‑ins [或 plugins]”，你还可以找到一些其他的插件供你使用。
 
在网站上，我们一般会列举一些我们认为足够稳定的可用于生产的插件，当然了你也可以在GitHub上找到一些成熟的插件。如果你有计划要使用Kong,我还是鼓励你们多去拥抱社区，拿社区已经成熟的插件，这样你就不用重复生产轮子了。

如果你需要做一些非常定制化的开发，你当然可以扩展Kong，你可以创建你自己的插件，这样你可以设计成你想要的。这些插件将会去访问OpenResty上那些事件，这样你就可以动态（实时）地改变请求（request）和响应（response）。

你也可以通过Kong发送请求去第三方的service。假设现在你有一个遗留的认证系统，你想要集成到API网关。你可以创建一个插件，可以让每个请求都路由到那个认证系统。然后在插件中处理[认证（authentication）]请求，然后返回响应，这样的话，客户端就只需向API发出请求。

#### Kong的入口（Kong Entry Points）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSrB4TpC0YCFghy8moicXHvWlOiark1f8kQwicucG1mGG9aFUXzZo3qvJSA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

Kong有两个关键入口。第一个叫做Proxy入口，就是消费者和客户端想要去消费上游的service们，可以访问默认的8000端口（或者SSL是8443，）来消费；第二个重要入口就是Admin API，是运行在8001端口上的，这个端口提供了你想要对Kong进行所有操作的API。

#### 核心的实体（Core Entities）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSABKBXosAt6xpPmxOwSNic8OmRzOSMcdTXCNt0LO75fnkRvushhwH5Aw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

演讲结束后，我们会快速的演示一下如何通过终端来使用Kong。在这之前，我希望你们能知道，Kong有三个核心的实体，这三个实体是你在API网关中总会用到的三个实体。这些实体是一些API，表示你想要尝试在Kong之后去请求的上游service。


你在Kong之后拥有成千上百的不同的service，我们叫这些service为apis（api们）。

然后，你得有消费者（consumers）， 其实就是客户端或者个人开发者，根据你具体的情况 — 总之就是那些想要去消费APIs的家伙。

消费者（consumer）可以是客户端app，可以是内部的（只针对团队内部的）也可以是公开的，也可以是合作伙伴。第三个实体就是插件（plugins），插件可以应用于API和消费者之上，来改变中间件的运作。

#### 插件配置矩阵（Plug‑ins Configuration Matrix）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSdG6kqxAjBaLuoNCkDXqkYALn04RpqKAVZqUtpT20ibyor576mrcx5hg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

举例来说，你可以让插件应用到每个API以及每个消费者（consumer）。如果你希望速率控制应用到每个service，并且速率限制为每秒每个service 200个请求。

或者你让插件应用于每个API，但只应用于特定的消费者。比如，你希望外部的每人每秒只能发送200个请求，但内部app没有任何的限制。你可以针对一个消费者，或者你可以针对每个API并且每个消费者。你可以灵活的配置这一切。

#### 多数据中心部署（Multi‑DC Deployment）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx5NhiazNsEsBIl3wg4d4icyzSxibHfGV0StyMT6JjqiauFK0OMWbbVPRMSU6ice7VibYEHNRNibQN19nYo7A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

这是一个多数据中心部署的使用场景。Kong作为客户端所有请求的入口。Kong接受请求（request），然后挑选出你想要访问的上游服务，并尝试运行与该API相关联的中间件。

举个中间件的例子，比如认证插件，假设它们按照执行顺序首先被执行。然后一旦Kong知道哪个消费者正在尝试使用API，它可以动态地加载所有这些信息。

Kong只有第一个请求才会去数据库里取信息。 在第一个请求中，Kong将从数据库中获取（解析）所有信息，然后将其缓存到内存中。 所以第一个之后的其他请求都会在内存中处理，这意味着Kong可以非常快，而不会在事务上增加太多的延迟。

如果您有两个不同的集群，则需要以某种方式将这些数据中心连接在一起。要同步（共享）的信息主要是Cassandra节点之间的数据，除此之外就是invalidation（使数据失效）事件。

由于Kong会在第一个请求时缓存所有的信息，如果你在其他的节点做了一些更改将会发生什么呢？第一个Kong节点是怎么知道数据不再有效的呢？在我们Kong节点之间，会彼此发送invalidation（失效、数据非法或叫变更）事件，所以每次你在某个Kong节点上做了操作，比如修改了上游服务的地址，那么这个节点就会通过发送一个invalidation事件到所有其他的Kong节点来使那个指定的实体失效。

其他的Kong节点收到失效（invalidation）事件然后删除这个实体。当一个新的请求进来后，Kong会强制重新去数据库里获取这个数据。

#### 答疑

###### Q: Kong可以对上游请求进行限速吗？ 例如，假设现在有1000个请求来自下游流，但是Kong将上游请求的数量限制为30，然后下游的请求以某种方式排队。

A:这绝对有可能。我今天使用的速率限制插件没有实现这个功能，但是你可以fork这个插件， 它是开源的，你可以使用Lua来实现这样的需求。

社区现在有另一个速率限制插件 - 这被称为“限流插件（quota rate‑limiting plug‑in）”。 它并不完全符合你的需求，你可以从API中配置请求（request）的速率限制。 在API响应（response）中，你可以设置一个自定义的header来告诉Kong，要为这个消费者提供的最大请求数。 如果将其设置为零，Kong将阻止该消费者发出的其他请求。

###### Q: 假设我有一个多租户系统，我有很多客户请求（request）发送给Kong，但是其中一个客户决定要疯狂地发送10,000倍的流量。 有没有可能让该客户的流量以某种方式排队，以免中断来自其他客户的流量，而不是通过速率限制？

A:相信这样的节流插件现在已经有了。 它可以应用于每个API和每个消费者，因此你可以为一个特定API的特定消费者创建插件配置，你可以对他进行特殊处理。

原文链接: https://mp.weixin.qq.com/s/Woktbld0-7bd73ySmVA3ug

作者: 贺卓凡译 Marco著
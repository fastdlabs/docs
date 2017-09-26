![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYAwc3wozSlhZA4FLFtHvwG7iaqy7Nic2p21lSGqGJZ35Zr4oEKrZLlu5w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

本文是来自于Macro在一次大会上的一个分享。

本系列共有两个部分，主要关注我们如何以及为什么要在我们的微服务应用中部署API 网关。第二部分主要关注我们如何把Mashape的开源网关组件Kong运用到我们自己的微服务架构当中。

![](http://mmbiz.qpic.cn/mmbiz_jpg/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYLEatic1PsJQdPBNAOiau3jQFS81FCoHhcAvicepgKlxoT8ic0mwQF8emHg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1)

#### 微服务与网关（Microservices & API Gateways）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYyoppvU90xI4VDoJIF9LPVcE2wuH3UiccJouDrp258GdYkwqS4jNSDoQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

大家好，我叫Macro，今天我们谈论有关微服务和网关的话题。我是Mashape的CTO,也同时是开源网关Kong的开发者之一。Kong是一个API网关，今天我们就来窥探一下它究竟是怎么工作的以及它如何运用到你的微服务架构中去。

#### 主题（Topics）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYeBZO9ZMGJRzpfaIBSRfsRSYBajRg6JlIpJjUlCxq0H2kdZV20Z1suw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

为了明白我们为什么需要API网关，我将从单体架构vs微服务架构谈起。这两个有什么不同点呢？然后我会介绍API网关模式以及它是如何适应“面向微服务”的架构的。然后我们会讨论Kong以及NGINX。

#### 单体架构（Monolithic Architecture）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYLIGE7vEByeZsicmuic3vqHun4fejlFicEkvkMicykibVURYwtnQeia1S3QIA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

Ok，过去几年我们目睹的一件事就是从单体应用到面向微服务的架构的过渡。我们都熟悉单体应用程序，以及它们通常的工作原理，这是一个简单的展示。我们把所有的东西都放到一块。而且通常也只有一个数据存储。

通过在多个服务器上重复部署相同的巨大代码块，可以横向扩展单体应用程序。所以每次我们调整应用程序时，我们其实相当于是在改动这些被放在一起的所有的模块，因为他们是一体的。

#### 单体应用的优缺点（Monolithic Application Pros and Cons）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxY9fXYOq2AesicEBcUwaWODXpKypVxaTCwwt6yMRZfURk1VlJMWl6XVbg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

每一种做法，都有利弊。单体应用程序可以比较容易地构建，而且是以更小的代码库来开始。我们可以在同一个代码库中构建和开发所有内容，这意味着我们不用担心模块化以及如何把不同的组件放在一起来共同工作这些事情。

而且测试起来也简单。通常当我们测试一个单体应用时，我们一开始就只面对一个应用，然后测试我们集成的单元测试。我们只需要面对一个应用就够了。

而且，很多IDE对单体应用已经支持的非常好了。比如Eclipse围绕着单体应用就提供了很多成熟的测试工具，包括idea也是。

但，你也许也发现了一个代码库(codebase)的问题，随着代码量的急剧膨胀，我们把所有的都放在一个代码库里显然不是一种理想的选择。随着时间的推移，越来越多的功能需要构建进去，代码越来越多，在一个地方跟踪代码将变得更加的困难。

由于这些原因，团队在一个大的代码库上迭代将会变慢。再来说个事情，比如我现在要更换数据库存储方案，或者想要使用一种新的技术。在单体应用中，这样的改动通常是非常痛苦的。

由于上面所有的原因，你开始扩张你的组织。然后发生的事情就是团队内部沟通成本变得更昂贵，因为理解代码库里的代码究竟是干什么的变得更加困难。

#### 微服务架构（Microservice-Oriented Architecture）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYNliasBvWKvia70vxEExP32yGNF4AxnEMtysP5qP7ricEY9nd6cH1WYbpQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

在过去的几年里（一两年吧），我们亲眼目睹了我们的应用架构向微服务转变的这个过程。容器在这个转变中也出了很大的力气，因为它围绕微服务创建了一些伟大的工具，这一部分我们稍后会具体谈到。

在一个微服务架构中，你把应用拆分成不同的模块（component）。于是取而代之的是多个不同的service被彼此独立的部署，彼此独立的伸缩。在上面的这个例子中，客户的订单和发票，这些模块将会被分别部署在他们自己的server上。

这些service之间的通信机制可以是多种格式的，通常是HTTP 或者 RPC（以及事件发布订阅的方式）。有时候你也可为每个模块分配不同的数据存储schema。这样的话，我们就把每个模块的能力都隔离开了，而且你还让它独立于其他模块而工作。

这样也意味着很多时候你可能需要通过事件源机制来搞定一些事件触发。在这个例子中，客户端创建一个新的订单。你就可以不用让客户端创建订单并且生成发票，取而代之的是，你可以创建一个新的订单，然后Orders这个模块push一个生成发票事件，然后其他的模块可以监听这个事件，然后来异步生成发票。

这样的话，你算是构建了一个异步的应用程序，它没有依赖于客户端并且它可以自主的为你生成发票。这也就是意味着，如果Invoices模块down了，可以在稍后重试生成发票。

#### 微服务架构的优缺点（Microservice-Oriented Application Pros and Cons）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYB8abBcloRn1IcY5EOYCUwhiaRFwL0n3VG1uU2mz0AZaexectxgSt4aw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

面向微服务的架构也有其两面性。微服务并不适合所有的主体，也不能hold所有的使用场景。它适合大型应用。如果您有大型应用程序，则可以将此大型应用程序拆分成不同的模块，开发人员将能够独立地迭代，维护和构建这些模块。

微服务的每个模块（component）只做一件事情，有且仅有一件事情可以做，你可以轻松基于此迭代并且尽情的完善和创新该模块，而且还不会影响到其他的模块。每个模块之间，彼此通过接口进行通信（大多数时候），比如HTTP RESTful接口。你可以改变和实验性的搞一些实现，只要接口不改变，应用就会保持正常的运转。

微服务，Microservices是micro。意味着如果你需要scale组织或团队，你可以为你的团队成员分配一些更小的，应用程序中的一些小碎片，更小的开发任务。这对于开发人员来说，有助于他们更快的理解自己要做什么，代码是如何运作的。而且迭代起来也更快。如果他们要用到其他的模块，他们可以使用接口去消费（consume）其他的模块，而不需要深入到其他模块的代码中去。

在单体应用中，有的地方发生了错误，意味着整个应用程序就无法运转了。很多时候一个bug导致整个应用程序就down了。而在微服务架构中，如果出现一个问题，这个问题是被隔离在一个特定的模块中或者是某个service中。

这意味着整个应用程序只有那一个service处于停止状态，而其他的模块则可以照常运转。就是说我们现在有Orders和Invoices两个模块。如果由于一些原因，开发人员在周五晚上push了一个bug到Invoices模块上，然后导致了发票模块不能工作。我们依然可以保存了这个发票事件。一旦Invoices模块恢复了，我们就可以继续生成发票了（那个之前由于bug而没有被创建的发票又可以被创建了）。

这样的功能我们在单体应用中也可以实现，但是由于微服务架构的推动，让这种事件驱动的风格更加的发扬光大，而随着时间的推移，单体应用变成了“意大利面应用”（spaghetti apps）。

面向微服务应用也有一些很典型的缺点。其中一个就是你现有有一堆不再“固定”的零部件。现在不再是单体那样一个app在一个地方做了所有事情。现在你有多个模块和（或）service。这些模块要在同一时刻共同配合才能最终呈现给用户。

这意味着你要有更强大的基础设施能力。现在你需要有一种魔法，要能简单地部署、伸缩、以及监控和管理这些不同的模块，这些独立的模块。这也是这些年来实时的在线监控和分析技术变得如此火爆的原因之一吧。因为一旦你是面向微服务的架构，你就必须去监控每一个碎片（零部件）并且要在一个集中的地方可以看到你的模块们的运行状态。

在单体中，你只有一个代码库来保存，执行并且所有的entity都在一块。在微服务架构中，我们有很多不同的模块，他们都彼此独立运行，并且只干一件事情。

这就意味着你现在有一个可用性的问题：service们也许会go down 不可用。或者还会有一致性问题：也许你需要把这些微服务scale到多个数据中心。所以你在创建一个应用时，就要把这些问题都要考虑进去。

如果你想要测试一个service，有的简单，有的比较难。这取决于你要测试的内容。

如果只是测试一个独立的模块，那就比较简单。但要测试一个多重依赖的那种的话可能就比较复杂了。通常的话，如果你想要测试一个构建于微服务架构之上的应用的话，前提条件就是你必须要同时启动所有的这些模块，这样可以确保彼此都可以相互通信，并且要成功地实现了集成测试。

#### 为什么需要API网关？

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYxUBxJHHDj3x2XH04JiaYzTexw4C9e1CriaJs4OWJ0e8G1Szp66YgMIxA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

Ok，为什么我们需要一个API网关呢？

我们总是听到编排这个词，所以我喜欢这张幻灯片 – 它展示了一个乐队，然后有个指挥家，下面一堆人（微型服务）演奏自己的乐器。这个指挥家（API网关）可以以某种方式来协调我们的架构如何处理请求。

#### API网关模式（API Gateway Pattern）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxY9LHz13gScVic0Cz5zzPO0jhVZuH0A2mUBmJ1QJjffFakwceobicRBSjg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

API 网关模式意味着你要把API 网关放到你的微服务们的最前端，并且要让API 网关变成由应用所发起的每个请求的入口。这样就可以明显的简化客户端实现和微服务应用程序之间的沟通方式。

以前的话，客户端不得不去请求Customers，然后再到Orders，然后是Invoices。客户端需要去知道怎么去一起来消费这三个不同的service。使用API网关，我们可以抽象所有这些复杂性，并创建客户端们可以使用的优化后的端点，并向那些模块们发出请求。

#### 优化后的端点（Optimized Endpoints）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYx9VZE1aausr3FT6KpvktGhnLd4L7qicSoLxNVZeZbDMeGKu2cjkC12Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

例如，优化的端点。如果我们假设客户（Customers），订单（Orders）和发票（Invoices）每个模块都返回不同的JSON响应，并且假设客户端想要检索此信息。有两种方法。一种方式是，客户端向客户(Customers)模块发出GET请求以检索客户，然后到订单(Orders)，然后到指定订单的发票（Invoices）。

第二种方式是我们可以通过使用API网关来抽象此客户端实现的复杂性。然后，API网关可以公开一个特定的端点，在这个端点上将产生请求，然后在[网关]消费了微服务之后返回给客户端一个唯一的响应（response）。

也就是说，比如，我们可以把很多的response折叠成一个，request也是一个。这样对我们帮助很大，而且特别是对于手机等其他移动客户端来说特别的受益。这样就可以加速我们的客户端的实现。而且可以轻松的做一些替换。

有一个很nice的事情，就是API网关让我们的客户端不用再需要知道和关心模块的地址（address）了。网关负责来搞这些事情，你只需要知道网关就好了。你可以去改变实现而且还可以改变API接口。不过通常来说，你改变接口后，会增加客户端出问题的风险。

使用API网关后，你可以在单独的层上有效地抽象，这样你就可以更改实现和接口，同时保持现有客户端的公共接口相同。这意味着你总是可以做一些调整的事情。

API网关对于那些从单体转变到微服务的应用来说也是一个非常有帮助的工具。如果你现在维护一个单体应用，你就可以把一个API网关放到这个单体的最前面，然后你就慢慢地开始把单体拆分成很多的不同的微服务，在这个过程中，客户端就一直是通过API网关来保持自己的运作，这样让你的迁移过程更优雅！

API网关将随着时间的推移实现和消费后端的上游service，同时保持客户端的正常工作。拥有一个API网关可以帮助我们实现这样的过渡。

#### 中心化中间件（Centralized Middleware Functionality）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYz4ZzmpvNA9KdngLPPAuoycn45NFMxD3ojmp0xFelguKfJJ5scdqGGQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

当然了，创建一个优化的端点仅仅是API网关的好处之一。你还可以通过API网关中心化中间件的能力。当你开始创建越来越多的服务时，你会发现自己面临了一个新的问题 – 就是你发现你需要对一些服务进行身份验证和流量控制。

有的服务是public的；有的是private的；有的则是合作伙伴的API，这些你只能提供给一些特定的用户。迟早你会发现自己在实现每个微服务时总是一次次的重复编写一些相同的代码，这些代码其实都是可以抽象为中间件的。

这显然不是每个微服务应该去关注的事情。API网关才应该把这件事情揽下，也就是说微服务只负责接收进来的request-然后返回一个类似JSON格式的response即可。然后API网关就把这些例如身份验证、日志（logging）以及流量控制都归于麾下。 

在这个slide，还要介绍的就是最下面的Faas（function as a service），这个是一个很酷的东西。它意味着你正在消费的某个API端点可能正在地球的某一个角落在做一些事情。
 
它也许运行在一个serverless的架构之上，或者并没有运行在你自己的server上。这意味着你同样可以在这些能力前面前置一个API网关，也可以在他们之上运行一些上面所说的那些中间件。

#### Ops: Blue/Green Deployments

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYEsSKx7VhM3LGgAlfXp7JvYxDXRzFxnc45u8L9QicdLR98dsKJ8iadRiaQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

这里我只是向你们展示了一些使用场景，然后让你知道它是如何让我们的“生活”变得更简单。比如，布署，deploy这件事情。在微服务架构中，一个特定的service也许在一天内要被deploy很多次（它不像单体时布署是一件艰难的事情）。

在单体应用中，布署（deployment）往往是一件比较耗时和缓慢的事情，因为你每次做的一点点改变，你都不得不要把一整个单体应用重新布署一遍。而且随着应用规模的增长，布署这件事情就变得越来越复杂。而在微服务中呢？你可以独立的去布署一个模块很多次，因为模块布署起来要更快更容易，因为只需要布署一个小小的块。

而且如果你需要，你还可以实现blue/green布署，API网关可以让这件事情通过一种简单的方式实现变为可能。比如，如果有一些Customer模块是1.0.0版本，有些Customer模块则是1.0.1版本。网关能够知道这些所有的版本的模块的location，然后提供接口可以让你从旧的版本切换到新的版本。

#### Ops:金丝雀发布（Canary Releases）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxY5xD2BJJVf8YwQb9wicPd64y02uvK8v9lNJVc05laeOA0mvv3gE3fWmg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

另一种发布策略是金丝雀发布（canaryreleases）。当我们创建软件的时候，有时候你不希望让所有的流量都一次性的到达新的版本，因为那个新的版本也许并没有测试地很充分。

金丝雀发布策略允许你直接只导入指定量的流量到新的版本，API网关就可以帮你来做这件事情。你可以配置10%的请求到新的版本，然后一旦你确保了新版本没有bug，你可以把流量切换到100%。

#### Ops:负载均衡（ Load Balancing）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYTpicWSYum3OGiak6rWuoMkjUeD65suMaac4HXMyLeEmytJLaLOmNicQ0Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

API网关的另外的一个能力就是可以负载均衡。在一定场景下，API网关可以是负载均衡器。API网关知道所有的service的地址和位置，所以你可以在API网关和上游service之间加一个负载均衡器。或者它本身就是一个负载均衡器。

当它是负载均衡器时，API网关就可以利用诸如Consul或etcd这些服务发现工具来负载均衡请求（request）。

每次你去请求一个DNS地址，服务发现（service‑discovery）工具就会给你一个新的IP地址。一般会在DNS这一层中做一些类似round-robin等策略的负载均衡。

#### Ops: 断路器（Circuit Breakers）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYjrySmYBnAyEG1ZrKZ7UshpW7EAgbbWOQvljVfqbfnN7s5Xficwk9qNQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

现在我们闭目想想，假定你的某个service突然停止了工作，然后返回了大量的错误。

API网关可以帮你实现断路器(circuit breakers)的能力,也就是说超过了指定的阈值，API网关就会停止发送数据到那些失败的模块。

这样就给了我们时间来分析日志，实现修复以及push更新。通常当你发现一个模块下的某个实例失败后，这时候这个模块依然还会接收流量，然后这个有问题的模块还调用了其他的模块，这样就会发生级联故障，或者叫雪崩。

断路器通过简单的断开流量的方式，这样就不会有新的请求到达那些有问题的实例，这时候我们就有相对充分的时间来修复和解决问题。

#### 构建微服务vs运行微服务（Building vs Running a Microservice）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYoEGP4fWqbKp0kcFMOnlqXYU6U0KICniaM2NbHIydTiavyiaPjWpK4hibIg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

在这里我想说明一个经常被误解的内容。有时，产品经理和软件工程师认为，构建API与运行API相同，因此构建微服务与运行微服务相同，但这是两个不同的问题。他们必须以不同的方式解决。

#### 工作量分布（Division of Labor）

![](http://mmbiz.qpic.cn/mmbiz_png/LsNc01I3kx7LrfK6uwHm9fr4Yz3MuFxYEQqvibrtEURgoiaLeTQKTSZVNQVENMyRfGPqEgu3y3Gfbiah29NrEKOTw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1)

我认为构建API通常是构建微服务器所需的工作量的50％。这是一个大概的估计，并不是把每个人都考虑到了。现在我们有一个API运行，它可以接受请求和返回响应，但是我们如何处理管理，身份验证，流量控制和速率限制？

那么我们用户的速率限制之后的下一步就是将这些用户的一小部分列入白名单的问题，允许这一部分人无论如何都不会被限制。这算是一种更高端的速率限制。

微服务可以为你提供更多，不仅仅是一个你可以消费的API。

然后是监控分析 - 这是非常重要的。你需要持续地监视和跟踪模块和文档的状态。  如果你有API，你还需要有适当的文档。这不仅对公共开发人员而言是重要的，而且对于组织内部的开发人员也是重要的。

比如你有一个语音API以及一个SMS API，如果您希望纽约和旧金山的两个团队合作，团队只需要发布一个API接口的文档，然后你组织内的任何人都可以使用那个API。保持文档最新是非常重要的。

这也是通常在创建新API时一般不会纳入那50％的一部分内容，但这确实是面向微服务的体系架构的一部分。

原文出自: https://mp.weixin.qq.com/s/XTzRr0eR6ybpNFGJ57cVkA

作者:  贺卓凡译 Macro
# 授权

授权隶属于中间件的其中一个单元，由中间件调度器进行分发处理。可以自定义实现自己的授权功能。

已完成的中间件，通过应用配置文件的 `middleware` 配置项进行配置，可以进行多维数据进行嵌套，最终通过 `withMiddleware` 获取 `withAddMiddleware` 进行分配。

授权认证主要依赖于: [basic-auth](https://github.com/JanHuang/basic-authenticate) 组件

### 网关

我们日常在开发 API 的时候，会有很多需要使用到鉴权的地方，而网关就是一个很常见的技术手段，网关推荐使用 [kong](https://getkong.org/)，其内不有大量丰富的插件与API，能够很好扩展业务。

有了网关，我们就可以将授权放到网关中处理，由网关完成授权的操作。

下一节: [异常处理](zh-cn/basic/2-7-exception-logger-handling.md)

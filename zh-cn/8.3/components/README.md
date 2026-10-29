# 组件总览

FastD 由一组独立组件构成，框架核心组合这些组件，应用骨架再组合框架。

```text
fastd/dobee
  └── fastd/fastd
        ├── fastd/container
        ├── fastd/config
        ├── fastd/event
        ├── fastd/http
        ├── fastd/middleware
        ├── fastd/routing
        └── fastd/swoole
```

可选组件：

- `fastd/cache`
- `fastd/medoodb`
- `fastd/dobee-demo`

| 组件 | 页面 |
|---|---|
| fastd/fastd | [fastd](fastd.md) |
| fastd/http | [http](http.md) |
| fastd/swoole | [swoole](swoole.md) |
| fastd/routing | [routing](routing.md) |
| fastd/middleware | [middleware](middleware.md) |
| fastd/container | [container](container.md) |
| fastd/config | [config](config.md) |
| fastd/event | [event](event.md) |
| fastd/cache | [cache](cache.md) |
| fastd/medoodb | [medoodb](medoodb.md) |
| fastd/dobee | [dobee](dobee.md) |
| fastd/dobee-demo | [dobee-demo](dobee-demo.md) |

组件页只记录关键使用方式和注意事项，完整 API 以各仓库 README、源码和测试为准。

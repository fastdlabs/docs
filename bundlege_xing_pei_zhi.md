#bundle个性配置

个性配置的写法与 `app/config/*` 里面的配置是一样的写法。个性配置，主要是用于一些独立 `bundle` 的灵活配置使用的。如果遇到重名，则会合并两者的数据，会有一定几率造成公用配置被覆盖，所以此处定义的配置最好以 `bundle` 名字进行区分。

#bundle个性配置

个性配置的写法与 `app/config/*` 里面的配置是一样的写法。个性配置，主要是用于一些独立 `bundle` 的灵活配置使用的。如果遇到重名，则会合并两者的数据，会有一定几率造成公用配置被覆盖，所以此处定义的配置最好以 `bundle` 名字进行区分。

如: 

```
return [
    'demobundle' => [
        'connection' => 'read'
    ]
];
```

那这个配置是会合并到全局配置当中，可以通过 `Config::getParameters` 或者继承 `BaseEvent` 的 `getParameters` 进行获取。

如上: 

```
class Demo extends BaseEvent
{
    public function demoAction()
    {
        return $this->getParameters('demobundle.connection');
    }
}
```
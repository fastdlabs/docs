# 数据分页

框架提供两个好用且简单的数据分页类，类中不直接绑定展示样式，只返回页码等信息，因此在使用上会更佳灵活便捷。

### ＃普通分页

普通分页不附带其他依赖，仅提供分页页码解析等 API 接口调用。

```php
FastD\Database\Query\Paging\Pagination::__construct($total, $currentPage = 1, $showList = 25, $showPage = 5);
```

```php
$page = new Pagination(10, 1, 4);

```

### ＃自动查询分页
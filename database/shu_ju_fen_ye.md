# 数据分页

框架提供两个好用且简单的数据分页类，类中不直接绑定展示样式，只返回页码等信息，因此在使用上会更佳灵活便捷。

### ＃普通分页

普通分页不附带其他依赖，仅提供分页页码解析等 API 接口调用。

```php
FastD\Database\Query\Paging\Pagination::__construct($total, $currentPage = 1, $showList = 25, $showPage = 5);
```

示例: 

```php
$page = new Pagination(10, 2, 4);
```

按照构造方法中所述，总页数为 10，当前页码为第 2 页，每页显示 4 条数据。所以，总页数应该是 3，因为 10 条记录，每页 4 条。

##### ＃获取总页数

```php
$page->getTotalPage(); // 3
```

##### ＃获取当前页

```php
$page->getCurrentPage(); // 2
```

##### ＃获取上下一页

```php
$page->getPrevPage(); // 1
$page->getNextPage(); // 3
```

##### ＃获取页码列表

```php
$page->getPageList(); // 1, 2, 3
```

### ＃自动查询分页

自动查询分页，需要传递 `Repository` 对象，因为上一节讲到，`Repository` 其实可以理解为一个表，因此在自动查询分页当中，需要传递 `Repository` 对象作为第一参数。

```php
FastD\Database\Query\Paging\QueryPagination::__construct(Repository $repository, $currentPage = 1, $showList = 25, $showPage = 5)
```

`QueryPagination` 提供 `getResult` 方法，用于自动分页的每页内容，所以整体操作与分页类是保持一致的。

```php

```
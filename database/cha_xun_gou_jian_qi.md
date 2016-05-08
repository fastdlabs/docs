# 查询构建器

查询构建器就是平时开发框架中的 `from()->select()` 等方法，其具体作用是自动构建 SQL 查询语句，方便开发，提高开发效率，但是构建器不支持复杂查询，具体复杂查询建议使用自己手写 SQL 语句进行查询，因为查询构建器无法保证高复杂度的查询效率。

```php
$queryBuilder = Mysql::singleton();
```

获取 Mysql 查询构建器，其他方法中 `createQueryBuilder` 
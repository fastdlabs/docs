# 修改日志

## 新特性

* 新增进程管理命令，新增 `process.php` 配置文件。支持自定义命令，守护进程。
* 新增 `FastD\Logger\Formatter\StashForamtter` 日志格式，支持 `logstash`。点击前往: [教程](blog/practice/practice-5-created-log.md)
* 新增 `FastD\ServiceProvider\MoltenServiceProvider`，支持 `zipkin` 调用链。点击前往: [教程](blog/practice/practice-6-created-zipkin.md)
* 替换 migration 为 [fastd/migration](https://github.com/JanHuang/migration)。点击前往: [教程]()

## Bug修复

* 修复 ArrayObject merge 覆盖的 bug
* 修复错误与异常无法显示的bug

## 其他优化

* 优化预设命令行，去除前缀
* 新增 `binary`, `version` 等辅助函数
* 优化 application 日志处理
* 优化 client 客户端
* 优化 console 命令端操作
* 优化 server 命令体验

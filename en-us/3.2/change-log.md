# Modify the log

## new features

* New process management command, add `process.php` configuration file. Support custom commands, daemons.
* Added `FastD \ Logger \ Formatter \ StashForamtter` log format, support` logstash`. Click to go to: [Tutorials] (http://blog.fastdlabs.com/2017-12-12/create-log)
* Added `FastD \ ServiceProvider \ MoltenServiceProvider`, support` zipkin` call chain. Click to: [Tutorial] (http://blog.fastdlabs.com/2017-12-12/create-zipkin)
* Replacing `migration` with [fastd / migration] (https://github.com/JanHuang/migration)
* Added `binary`,` version`, `forward` and other helper functions
* Added mysql query builder
* Restore time zone configuration
* Improve the surrounding services

## remove

* Remove basic auth default dependencies, extended into service providers
* Remove cache middleware default dependencies, extended into service providers

## Bug Fix

* Fixed ArrayObject merge covered bug
* Fix bugs that bugs and exceptions can not be displayed

## Other Optimization

* Optimize the default command line, remove the prefix
* Optimize application log processing
* Optimize client client
* Optimize console command-side operation
* Optimize server command experience
* Optimize the directory structure
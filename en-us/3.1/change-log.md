# Modify the log

### 3.1.0-rc4

* Add Common Cache Middleware
* bug fixed
* Built-in migration is_available, created_at, updated_at database three standard fields,
* Added abort interrupt function

### 3.1.0-rc3

* Fix unit test data reset bug

### 3.1.0-rc2

* Enhanced log configuration, add the fourth parameter added, which means custom log format, the default is empty, the realization of the principle: [Click] (2-5-exception-logger-handling.md)
* Increase the error output configuration, you can hide trace output in the production environment
* Modify the unit test namespace from `FastD \ Test \ TestCase` to` FastD \ TestCase`
* Add additional applications `shutdown` method, mainly for post-log processing, statistics buried point.
* Update the document

### 3.1.0-rc1

* Enhanced log configuration options to array configuration, support for custom log location, level, default `Monolog \ Logger :: NOTICE`
* Increase the default cache path
* Added `FastD \ Model \ Database` object to add connection survivability detection to prevent connection pool hangs causing process anomalies
* Added TestCase test method to make the test case more humane

### 3.1.0-beta2

* Uniform file name, does not affect the operation
* Added model: create command
* Added controller: create command
* Upgrade testing, increase dbunit. Add composer option `--no-dev` in production
* Adjust the seed: create structure, from the up method to setUp, setUp method returns the table object, and add the dataSet method
* Adjust seed: create command to generate location
* Added client client command
* Update the document
* Remove the configuration file app.php log configuration key log keys, to a one-dimensional array, you can configure multiple log objects
* Implement dbunit test suite

### 3.1.0-beta1

* Modify Server configuration
* Remove too much useless configuration
* Modify the service configuration items for providers
* Add route command
* Built-in TCPServer, HTTPServer
* Integrated testing, dbunit testing
* Add Servitization service module
* Add routing group middleware
* Remove Http directory, changed to Controller, support for HTTP, TCP calls
* Added Swoole client command line, `php bin / console client {host} {port} {service} {arguments}
* Adjust config / database.php configuration items
* Modify the process pid file, application cache file directory runtime
* New database structure processing command `seed: create`,` seed: run`
* Add Seed database structure
* Add status monitoring service
* New connection pool
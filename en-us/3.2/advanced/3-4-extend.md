# Extended

The framework provides services in a smart way, with most services relying on composer.json and [service provider](en-us/3.2/advanced/3-3-service-provider.md).

If the database service relies on `catfan/Medoo`, register to the global core via [DatabaseServiceProvider.php](https://github.com/JanHuang/fastD/blob/master/src/ServiceProvider/DatabaseServiceProvider.php).

If the framework can not meet the business needs, you can deploy the composer dependencies, add ServiceProvider to the application, you can complete the expansion

If you have any questions, you can refer to [ServiceProvider](https://github.com/JanHuang/fastD/tree/master/src/ServiceProvider)

* [Eloquent ORM](https://github.com/zqhong/fastd-eloquent)

## Development FastD expansion package

Believe that the use of Symfony, Laravel's friends all know that if the framework supports expansion package development, or have good support for the expansion package, then the development can be said to be a duck, in version 2.0, also supports the development of the package.
 
* [FastD ServiceProvider](https://github.com/linghit/service-provider)
* [FastD Viewer](https://github.com/JanHuang/viewer)
* [FastD ORM](https://github.com/zqhong/fastd-eloquent)
* [FastD QConf](https://github.com/JanHuang/QConfServiceProvider)

Next Section: [Monitoring](en-us/3.2/advanced/3-5-monitor.md)
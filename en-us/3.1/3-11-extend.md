# Extended

Frameworks provide services in a deft manner, with most services relying on composer.json and Service Provider (zh-cn / 3.1 / 3-6-service-provider.md).

If the database service relies on `catfan / Medoo`, register to the global core via [DatabaseServiceProvider.php] (../../ src / ServiceProvider / DatabaseServiceProvider.php).

If the framework can not meet the business needs, you can deploy the composer dependencies, add ServiceProvider to the application, you can complete the expansion

If you have any questions, you can refer to [ServiceProvider] (../../ src / ServiceProvider)

## Development FastD expansion package

Believe that the use of Symfony, Laravel's friends all know that if the framework supports expansion package development, or have good support for the expansion package, then the development can be said to be a duck, in version 2.0, also supports the development of the package.

Next Section: [Idea and Architecture] (en-us / 3.1 / 4-1-lifecycle.md)
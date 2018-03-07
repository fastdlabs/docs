# Extended

The framework provides services in a smart way, with most services relying on composer.json and [service providers] (3-6-service-provider.md).

If the database service relies on `catfan / Medoo`, register to the global core via [DatabaseServiceProvider.php] (../../ src / ServiceProvider / DatabaseServiceProvider.php).

If the framework can not meet the business needs, you can deploy the composer dependencies, add ServiceProvider to the application, you can complete the expansion

If you have any questions, you can refer to [ServiceProvider] (../../ src / ServiceProvider)

Next: [Idea and Architecture] (en-us / 3.0 / 4-1-lifecycle.md)
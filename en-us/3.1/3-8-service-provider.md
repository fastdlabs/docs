# Service provider

The service provider provides custom extensions and handles for the import, depending on the [container] (https://github.com/JanHuang/container)

Each provider needs to implement the `FastD \ Container \ ServiceProviderInterface` interface, implement the` register` method, and handle service provisioning.

Such as database service provider

`` `php
<? php

namespace FastD \ ServiceProvider;

use FastD \ Container \ Container;
use FastD \ Container \ ServiceProviderInterface;
use FastD \ Pool \ DatabasePool;

/ **
 * Class DatabaseServiceProvider.
 * /
class DatabaseServiceProvider implements ServiceProviderInterface
{
    / **
     * @param Container $ container
     * /
    public function register (Container $ container)
    {
        $ config = config () -> get ('database', []);

        $ container-> add ('database', new DatabasePool ($ config));

        unset ($ config);
    }
}
`` `

Through the `register` method, the service is injected into the` container` container for global use because the entire Application is a container. Specific view [Application.php] (../../ src / Application.php)

The final new service provider by `Class :: class` added to the application configuration services configuration items can be.

The overall application is based on the "container" and constitute, if you are not familiar with the concept of the container, you can refer to: [Pimple] (https://github.com/silexphp/Pimple), [PHP-DI] (https : //github.com/PHP-DI/PHP-DI), [container] (https://github.com/JanHuang/container)

If you master more container-related knowledge, I believe we can make good use of the framework.

If you need to try to add or modify the service provider, you can refer to [DatabaseServiceProvider] (../../ src / ServiceProvider / DatabaseServiceProvider.php), [database.php] (../../ tests / app / default / config /database.php), [app.php] (../../ tests / app / default / config / app.php)

Next Section: [Swoole Server] (en-us / 3.1 / 3-9-swoole-server.md)
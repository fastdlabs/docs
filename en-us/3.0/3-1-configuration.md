# Apply the configuration

Application configuration is divided into 3 configuration types

1. Basic configuration
Server configuration
3 custom configuration

The basic configuration consists of:

1 routing configuration
2. Application Configuration

Composition, are stored basic business configuration and routing access to the place.

##### Routing configuration

Routing configuration is specific routing configuration information, please go to: [Routing and Controllers] (en-us / 3.0 / 2-1-routing-and-controllers.md)

##### Application Configuration

Application Configuration is a collection of the overall core configuration, including time zone, environment, log, service providers, middleware, etc., can be customized [Service Provider] (zh-cn / 3.0 / 3-6-service-provider. md) to read the specific configuration.

For more information, check out: [app.php] (../../ tests / config / app.php)

> !! The default configuration items please do not delete

##### server configuration

The server configuration item listen is required and is the address that the Swoole server listens on. For other configurations, please see [Swoole Configuration] (http://wiki.swoole.com/wiki/page/274.html)

##### Custom configuration items

database.php and cache.php are extensions provided by default in the framework and are handled concretely by `DatabaseServiceProvider` and` CacheServiceProvider`.

Where database.php and cache.php although the framework provided by default, but they belong to one of the custom service providers.

If you need to add or modify the service provider, please refer to: [Service Provider] (en-us / 3.0 / 3-6-service-provider.md)

Next Section: [Middleware] (en-us / 3.0 / 3-2-middleware.md)
# Authorized

Authorized to belong to one of the middleware unit, the middleware scheduler distribution processing. Can be customized to achieve their own authorization function.

The completed middleware is configured through the `middleware` configuration item of the application configuration file and can be used to nest multidimensional data and finally obtain` withAddMiddleware` through `withMiddleware`.

Authorization authentication mainly relies on: [basic-auth](https://github.com/JanHuang/basic-authenticate) Components

### Gateway

We often have a lot of places to use authentication when we develop APIs. Gateway is a very common technical means. Gateway recommends using [kong] (https://getkong.org/) without any Extensive set of plug-ins and APIs to expand your business.

With the gateway, we can put the authorization into the gateway to handle, the gateway to complete the authorized operation.

Next section: [Exceptions](en-us/3.2/basic/2-7-exception-logger-handling.md)
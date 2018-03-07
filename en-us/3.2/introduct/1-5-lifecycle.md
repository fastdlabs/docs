# Life cycle

Since FastD runs on both FPM and Swoole, the lifecycle of FPD is the same as normal PHP in the FPM environment.

So in Swoole operating environment, it is running in memory, conventional PHP developers are not very good memory clean-up management, so if running in the Swoole environment, you need to clean up the useless data, the abnormal Processing, clearing exit / die and other operations.

### Start / boot

When the application launches the `bootstrap` method, the program officially enters the initialization phase and registers the core service and configuration with the container (application).

1. Load application configuration
2. Register system services and custom services
Load the route
4. Mark has been booted

### request

When the application receives the user request, it will first be processed by the Http component and then passed to the routing scheduler for scheduling.

Receive the request
Matching routing
3. Processing middleware
4. Return processing

### response

After processing the request, the application receives the return, after processing the test package, returned to the client.

1. Receiving process returns
2. Return to the client (output)

### drop out

In FPM mode, FPM automatically cleans up or resets all the information when the application response is completed, while in Swoole runtime it resets some of the one-time data and the internal logic does not clean it up Logical processing of data cleaning.

Clean up the data
Logging

# Architecture and philosophy

Provide a backbone that allows developers to flexibly disassemble parts (ServiceProvider) to make projects, functions more independent and flexible.

Next section: [Configuration] (en / basic / 2-1-configuration.md)
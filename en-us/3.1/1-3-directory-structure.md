# Directory Structure 

`` `
config
    app.php application default configuration
    config.php User-defined configuration
    database.php database configuration
    routes.php routing configuration
    server.php swoole server configuration
    cache.php cache configuration
database
    schema database migration file
    dataset dbunit data set
src
    Console console command
    Controller
    Middleware middleware
    ServiceProvider Custom Service Provider
    Model data model
    Testing unit testing
bin
    console command line management
    server swoole service
    client client
web
    index.php application entry file
runtime program data directory
    pid server pid file directory
    logs log directory
    cache file cache directory
`` `

Source code is placed in the src directory, if the directory does not meet business needs, you can adjust the `composer.json` file for adaptation.

Next Section: [Framework Execution Flowchart] (en-us / 3.1 / 1-4-flow.md)
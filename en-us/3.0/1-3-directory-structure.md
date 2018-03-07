# Directory Structure 

`` `
config
     app.php application default configuration
     config.php User-defined configuration
     database.php database configuration
     routes.php routing configuration
     server.php swoole server configuration
     cache.php cache configuration
src
     Console console command
     Http
         Controller Http Controller
     Middleware Http middleware
     ServiceProvider Custom Service Provider
     Testing unit testing
bin
     console
     server
web
     index.php
`` `

Source code is placed in the src directory, if the directory does not meet business needs, you can manually modify the way to adjust.

Next section: [routes and controller] (en-us/3.0/2-1-routing-and-controllers.md)
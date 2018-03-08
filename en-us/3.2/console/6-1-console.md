### config command

Used to view the config configuration file information, and output it to the terminal in json format. It can be used for debugging in the QConf Configuration Center.

```php
$ php bin/console config
```

View the specified profile information

```php
$ php bin/console config app
```

### controller command

Used to create the initialization controller.

```php
$ php bin/console controller Demo
```

### model command

Used to create an initial data manipulation model.

```php
$ php bin/console model Demo
```

### migrate command

Execute the data migration command. Details can be found at: [Data Migration] (en-us/3.2/database/4-4-migration.md)

### route command

Check all routes for debugging, list of routes and details

```php
$ php bin/console route
```

### process command

Used to manage the process, when we write the process of processing logic, you can use the command to manage. Detailed operation can be seen: [Process Management](en-us/3.2/process/7-1-swoole-processor)

```php
$ php bin/console process name
```
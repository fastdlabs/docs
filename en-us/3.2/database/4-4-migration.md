# data migration

Version 3.2 provides a more complete data migration capabilities, since: [fastd / migration] (https://github.com/JanHuang/migration) components

### basic use

The migration component provides easy-to-use command-line tools for quick access through the terminal window.

##### info command

This command lists all the tables in the existing database and displays them through the terminal

`` `php
$ php bin / console migrate info
`` `

By adding the table name, view the detailed data table structure.

`` `php
$ php bin / console migrate info table
`` `

##### dump command

The dump command is used to export the data table structure into a seed table structure that can be used to export the local database structure and then submit the code for use by others as the code is merged and updated.

`` `php
$ php bin / console migrate dump
`` `

Export the specified table structure

`` `php
$ php bin / console migrate dump table
`` `

##### seed

Create a seed seed file.

`` `php
$ php bin / console migrate seed table
`` `

The structure is created as follows:

`` `php
<? php

use \ FastD \ Migration \ MigrationAbstract;
use \ FastD \ Migration \ Table;


class {Table} extends MigrationAbstract
{
    / **
     * {@inheritdoc}
     * /
    public function setUp ()
    {
        $ table = new Table ('hello');

        $ table
            // some code
        ;

        return $ table;
    }
}
`` `

##### run

Execute the seed file and automatically populate the data, the data can be used to pre-define the test data, which will help speed up application testing.

`` `php
$ php bin / console migrate run
`` `

Run the specified table.

`` `php
$ php bin / console migrate run table
`` `

Custom data sets stored in the dataset directory by default, can be adjusted by the `-d` parameter.

The program will automatically read the yml file name of the table to read, and then insert operation.

!> Each run of the program to perform a data filling, if you want to re-insert, execute the cache --clear command to clear the cache.

`` `php
$ php bin / console migrate run table -d / tmp
`` `

##### cache

Cache processing operations, used to view and clean up cached data, without affecting business processes.

`` `php
$ php bin / console migrate cache
`` `

clear cache

`` `php
$ php bin / console migrate cache --clear
`` `
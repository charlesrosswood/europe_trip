*SETTING UP THE PROJECT
*======================
To setup the project, on the command line (either in the IDE or the Windows terminal) run:

 .\project_setup.bat

This will output errors if (1) Python 3.4.3 is not installed, (2) npm (NodeJS package manager) is
not installed, (3) PostgreSQL binaries could not be found. The output will direct you to the
websites to download these dependencies.

After settling the dependencies, rerun project_setup.bat and it will install all the project
Python and JavaScript dependencies (it does not need a C++ compiler to install the Psycopg2
dependency).

*SETTING UP THE DATABASE
*=======================
From the command line run

 .\create_db.bat

This will drop any previously existing database with the name "europe_trip" and build a new one
with new tables and insert 2 test users and 2 test posts.

*RUNNING THE DEV SERVER
*======================
Each time any JavaScript is changed the JS bundles need to be rebuilt. Browserify is used to handle
JS dependencies and allow JS modules to be imported into other JS modules. Top level JS files
are called "main.js" under their containing folder, these act as the main JS components for a
template. To rebuild all the JS modules simply run on the command line:

 .\run_dev_server.bat

This will bundle all the JS dependencies into <module_name>_bundle.js, where <bundle_name> is the
containing folder name. These should be imported into the appropriate HTML template using this
bundle name.
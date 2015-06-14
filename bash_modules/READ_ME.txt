*SETTING UP THE PROJECT
*======================
To setup the project, on the command line (either in the IDE or the *nix terminal) run:

 .\project_setup.sh

This will output errors if (1) Python 3.4.3 is not installed, (2) npm (NodeJS package manager) is
not installed, (3) PostgreSQL binaries could not be found. The output will direct you to the
websites to download these dependencies.

After settling the dependencies, rerun project_setup.bat and it will install all the project
Python and JavaScript dependencies (it requires a C++ compiler to install the Psycopg2
dependency, GCC will do fine and should be part of your setup, else install gcc).

*RUNNING THE DEV SERVER
*======================
Each time any JavaScript is changed the JS bundles need to be rebuilt. Browserify is used to handle
JS dependencies and allow JS modules to be imported into other JS modules. Top level JS files
are called "main.js" under their containing folder, these act as the main JS components for a
template. To rebuild all the JS modules simply run on the command line:

 .\run_dev_server.sh

This will bundle all the JS dependencies into <module_name>_bundle.js, where <bundle_name> is the
containing folder name. These should be imported into the appropriate HTML template using this
bundle name.
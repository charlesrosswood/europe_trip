#!/usr/bin/env bash

pyv="$(python -V 2>&1)"
pyv3="$(python3 -V 2>&1)"

if [[ $pyv3 == "Python 3"* ]]
then
    echo "Python 3 found (version: $pyv3)..."
    ./_build_run_server.sh python3
elif [[ $pyv == "Python 3.4.3rc1" ]]
then
    echo "Python 3 found (version: $pyv)..."
    ./_build_run_server.sh python
elif [[ $pyv == "Python 2"* ]]
then
    echo "Python 2 found (version: $pyv)..."
    ./_build_run_server.sh python
else
    echo "Error"
fi
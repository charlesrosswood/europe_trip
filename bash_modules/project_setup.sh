#!/usr/bin/env bash

# If this fails (skip where appropriate):
#  1. Install Node from https://nodejs.org/
#  2. Install Python 3.4.3 rc1 from https://www.python.org/downloads/release/python-343rc1/

pyv="$(python -V 2>&1)"
pyv3="$(python3 -V 2>&1)"
python_version_found=false
python_version_swapped=false


# Testing for which version of Python - very verbose!
if [[ $pyv == *"command not found"* ]]
then
  printf "Python not found\n"
elif [[ $pyv != "Python 3.4.3rc1" ]]
then
  printf "Python 3.4.3rc1 required, found $pyv \n"
else
  printf "Python 3.4.3rc1 found\n"
  python_version_found=true
  python_version_swapped=true
fi

if [[ $pyv3 == *"command not found"* ]]
then
  printf "Python 3 not found\n"
fi

if [[ $pyv3 != "Python 3.4.3rc1" && $pyv3 == "Python"* ]]
then
  printf "Python 3.4.3rc1 required, found $pyv3 \n"
elif [[ $pyv3 == "Python 3.4.3rc1" ]]
then
  printf "Python 3.4.3rc1 found, continuing \n"
  python_version_found=true
fi

# Checking if npm is installed
npm="$(npm -v 2>&1)"
npm_found=false

if [[ $npm == *"command not found"* ]]
then
  printf "npm not found \n"
else
  printf "npm found \n"
  npm_found=true
fi

if [[ $python_version_found == true && $npm_found == true ]]
then

  printf "Checking if browserify installed \n"
  browserify_check="$(browserify -h)"
  if [[ $browserify_check == *"command not found"* ]]
  then
    printf "Not found, installing... \n"
    npm install -g browserify
    printf "Installed Browserify! \n"
  fi

  printf "Installing project Python requirements... \n"
  if [[ $python_version_swapped == true ]]
  then
    pip install -r ../requirements.txt
  else
    pip3 install -r ../requirements.txt
  fi

fi

if [[ $python_version_found == false ]]
then
  printf "\n\nPython 3.4.3rc1 not found. Please install form here: https://www.python.org/downloads/release/python-343rc1/"
fi

if [[ $npm_found == false ]]
then
  printf "\n\nnpm not found, probably because Node.js wasn't installed. Please install from here:https://nodejs.org/"
fi

printf "\n\nDone! \n\n"

#!/bin/bash

#
#   We do a few things in this install script and some of them require root
#   access, but we don't run this script as root, so we print some instructions
#   at the end, rather than requiring the user to install as root.
#

# first, change the working dir to the dir where the install.sh lives
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
pushd $SCRIPTPATH > /dev/null
echo -e " * Set current working dir to `pwd`"

# now get python3
PYTHON=`which python3`
echo -e " * Python3 path is $PYTHON"

# if the venv exists, assume we're doing a reinstall and 86 it
if [[ -e venv/ ]]; then
    echo -e " * Virtual environment detected. Removing..."
    rm -rf venv/
fi

echo -e " * Installing virtual environment..."
$PYTHON -m venv venv

# now activate the venv and install dependencies
source $SCRIPTPATH/venv/bin/activate
pip install -r requirements.txt > /dev/null
echo -e " * Done!"

# next, create an API key
APIKEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 26 | head -n 1)
echo $APIKEY > .api_key
echo -e " * Created API key!"

# make a dev cert in the deploy directory
if [[ -e deploy/ ]]; then
    echo -e "\n * Previous deployment detected. Removing old certs..."
    rm -rf deploy/
fi

mkdir -p deploy
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -keyout deploy/dev_key.pem -out deploy/dev_cert.pem

echo -e "\n Installation is complete!"
echo -e " To run the server in development mode, execute $SCRIPTPATH/server.sh"
echo -e " To deploy the server using supervisord, see $SCRIPTPATH/deploy/README.md for more info!\n"

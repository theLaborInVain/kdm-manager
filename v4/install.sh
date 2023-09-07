#!/bin/bash

# subs
create_cert() {
    echo " * Creating certificates..."
    # Add your certificate creation logic here

    echo -e "\n * Removing old certs..."
    rm -vf deploy/*.pem

    openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -keyout deploy/dev_key.pem -out deploy/dev_cert.pem

}


loading_animation() {
    local pid=$1
    local msg=$2
    local delay=0.1
    local spin_chars=("/" "-" "\\" "|")

    while [[ -d "/proc/$pid" ]]; do
        for char in "${spin_chars[@]}"; do
            printf "\r * %s %c " "$msg" "$char"
            sleep $delay
        done
    done
    echo -e "\n * Done!" 

}

install_venv() {

    # if the venv exists, assume we're doing a reinstall and 86 it
    if [[ -e venv/ ]]; then
        echo -e " * Virtual environment detected! venv/ removed."
        rm -rf venv/
    fi

    # install venv
    $PYTHON -m venv venv &
    subfunction_pid=$!
    loading_animation $subfunction_pid "Installing virtual environment"
    wait $subfunction_pid

    # activate the venv and install dependencies
    source $SCRIPTPATH/venv/bin/activate
    pip install -r requirements.txt > /dev/null &
    subfunction_pid=$!
    loading_animation $subfunction_pid "Installing dependencies"
    wait $subfunction_pid

}


# first, change the working dir to the dir where the install.sh lives
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
pushd $SCRIPTPATH > /dev/null
echo -e " * Set current working dir to `pwd`"

# now get python3
PYTHON=`which python3`
echo -e " * Python3 path is $PYTHON"

# install virtual env
install_venv

# next, create an API key
APIKEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 26 | head -n 1)
echo $APIKEY > .api_key
echo -e " * Created API key!"

# prompt re: certs
read -p " * Create self-signed SSL certificate? (y/n): " choice
if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
    create_cert
else
    echo " * Certificate NOT created."
fi


echo -e "\n Installation is complete!"
echo -e " To run the server in development mode, execute $SCRIPTPATH/server.sh"
echo -e " To deploy the server using supervisord, see $SCRIPTPATH/deploy/README.md for more info!\n"

#!/bin/bash

# path to self
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

start_venv() {

    # change to the directory where server.sh lives
    pushd $SCRIPTPATH > /dev/null

    # sanity check: log the launch time; make the log dir if it doesn't exist
    LAUNCHTIME=`date +%F' '%T`
    if [[ ! -e logs/kdm-manager.log ]]; then
        mkdir -p -v logs/
    fi
    echo -e "[$LAUNCHTIME] Starting web server..." >> logs/kdm-manager.log

    # now check for the virtual environment; if it doesn't exist
    echo -e "\nVirtual Environment:"
    if [[ ! -e $SCRIPTPATH/venv ]]; then
        echo -e " * Virtual environment not installed! Did you run install.sh?\n"
        exit 666
    fi
    source $SCRIPTPATH/venv/bin/activate

    export FLASK_ENV=development
    export FLASK_DEBUG=1
    export FLASK_RUN_PORT=8014
    export FLASK_RUN_HOST='0.0.0.0'
    export FLASK_RUN_CERT=deploy/dev_cert.pem
    export FLASK_RUN_KEY=deploy/dev_key.pem

    PYTHON_VERS=`python --version`
    echo -e " * interpreter $PYTHON_VERS"
    echo -e "\nPIP:"
    pip freeze $1 | while read x; do echo -e " * $x"; done
    echo -e
    echo -e "Flask server:"

}

start_venv
flask run

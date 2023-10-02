#!/bin/bash

PORT=8014
WORKERS=3

# change CWD to project dir
DEPLOYDIR="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
pushd $DEPLOYDIR > /dev/null
cd ..

# start the gunicorn process in production mode
source venv/bin/activate
export FLASK_ENV=production
venv/bin/gunicorn -b localhost:$PORT -w $WORKERS --forwarded-allow-ips "*" app:app

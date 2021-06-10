#!/bin/bash

#
#   Please review README.md before running this script! It expects that
#   nginx and supervisord are installed in the vanilla Debian/Ubuntu way
#   and that you are using the default config directories for both!
#

if [[ $EUID -ne 0 ]]; then
   echo -e "\n\tThis script must be run as root!\n"
   exit 1
fi


#
#   Copies some symlinks; runs supervisorctl
#

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
SUPERVISORCTL=`which supervisorctl`
NGINXCTL=`which nginx`

install() {

    # make sure we're in the /deploy/dir
    pushd $SCRIPTPATH > /dev/null
    echo -e " * Set current working dir to `pwd`"

    # create the symlinks
    echo -e " Creating symlinks:"
    ln -v -s $SCRIPTPATH/supervisor.conf /etc/supervisor/conf.d/kdm-manager.conf
    ln -v -s $SCRIPTPATH/nginx.conf /etc/nginx/sites-enabled/kdm-manager

    # reload services
    echo -e "\n Reloading services:"
    /etc/init.d/nginx reload
    $SUPERVISORCTL reload
    $NGINXCTL -s reload

    sleep 3
    tail /var/log/supervisor/supervisord.log
    echo -e ""
    netstat -anp |grep "0.0.0.0:8014"
    echo -e "\n Done!\n"
}

echo -e "\n\tKDM-Manager! Installer"
read -sn 1 -p "
 Press any key to install The Manager...
";echo

install

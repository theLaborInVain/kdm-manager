# Production server setup
The Manager is meant to be deployed on a Debian/Ubuntu type system.

## Prerequisites
This guide assumes as Debian/Ubuntu environment and root access.

1. Clone the repository to your home directory: `~$ git clone git@github.com:theLaborInVain/kdm-manager.git`
1. Navigate to the `v4` folder and run the `install.sh` script (optionally self-sign an SSL cert)
1. Run the server interactively to install dependencies in the virtual environment: `~$ ./server.sh`

## Rapid deployment

The deploy.sh script in this repository does three things:

1. checks to make sure you're running as root
1. creates symlinks to the supervisord and nginx config files 
1. sets up log rotation for the */logs/* files

If it finishes successfully, the Manager will be fully deployed!


## supervisord
The Manager comes with default/baseline configuration files meant to support a
production deployment. These live in `v4/deploy`.

The steps outlined below assume that supervisord is installed and that you
intend to run it as root, i.e. that you are going to stop/start/restart
the Manager as root.

The */deploy/supervisor.conf* file that ships with this repository should not
require modification.

Create a symbolic link to the file:

``` TBD ```


## nginx

The Manager is web server agnostic, but the deploy.sh script in this repository
is designed to facilitate deployment via nginx.

Please be sure to modify the */deploy/nginx.conf* included in `v4/deploy`
to meet your specific deployment needs, e.g. the URL where you want the webapp
to respond, etc.



# Dependencies

The Manager is meant to be deployed on a Debian/Ubuntu type system.


## supervisord

The Manager uses supervisord for process control, i.e to run the server as a
'daemon' type process.

If you are new to supervisord, it's got
[a pretty nice website](http://supervisord.org/) that can take you through
the basics.

The steps outlined below assume that supervisord is installed and that you
intend to run it as root, i.e. that you are going to stop/start/restart
the Manager as root.

The */deploy/supervisor.conf* file that ships with this repository should not
require modification.


## nginx

The Manager is web server agnostic, but the deploy.sh script in this repository
is designed to facilitate deployment via nginx.

If you are unfamiliar with nginx, they also have
[a nice website](https://www.nginx.com/).

Please be sure to modify the */deploy/nginx.conf* included with this repository
to meet your specific deployment needs, e.g. the URL where you want the webapp
to respond, etc.


## Rapid deployment

The deploy.sh script in this repository does three things:

1. checks to make sure you're running as root
1. creates symlinks to the supervisord and nginx config files 
1. sets up log rotation for the */logs/* files

If it finishes successfully, the Manager will be fully deployed!

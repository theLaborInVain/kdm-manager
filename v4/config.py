"""

    settings.cfg is deprecated starting in 2021.

    (This includes settings_private.cfg; use the instance/ folder instead.)

"""

# standard library
from datetime import datetime
import os
import socket
import sys

class Config():
    ''' Miguel Grinberg style config 'object' used by the Flask app. '''

    with open('.api_key', 'r') as file:
        API_KEY = file.read().strip().replace('\n', '')

    API = {
        'url': 'https://api.kdm-manager.com/',
        'verify_ssl': True,
    }

    APP_AGE = int((datetime.now() - datetime(2015, 11, 10)).days / 365)
    APP_DESC = (
        "KDM-Manager is a free, online campaign manager application for "
        "Kingdom Death: Monster that uses interactive forms and "
        "automates repetitive record-keeping tasks. "
    )
    APP_NAME = "KDM-Manager"
    APP_TAG = "The original online campaign manager for Kingdom Death: Monster!"
    SESSION_COOKIE_NAME = 'kdm-manager_session'
    SECRET_KEY = os.environ.get('SECRET_KEY') or str(sys.path)
    VERSION = "4.0.0"


    def __init__(self, flask_environment):
        ''' Checks the environment to determine if we shoudl use a local
        API or just go to prod. '''

        if flask_environment in ['dev', 'development']:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.connect(("8.8.8.8", 80))
            local_ip_address = sock.getsockname()[0]
            sock.close()

            self.API = {
                'url': 'https://%s:8013/' % local_ip_address,
                'verify_ssl': False,
            }

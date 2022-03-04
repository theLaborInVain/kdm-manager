"""

    Initialize the application, which is conveniently named 'app'.

"""

# second party imports
import flask
import flask_login

# application imports
from config import Config

#
#   import the app!
#
app = flask.Flask(__name__)
app.config.from_object(Config(app.env)) # pass the env to config
login = flask_login.LoginManager(app)
login.login_view = 'login'

# pace, PEP8
from app import routes
app.logger.info('KDM Manager application is running...')

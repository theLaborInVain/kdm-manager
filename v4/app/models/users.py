"""

    We initialize users as objects that are partially composed of Flask stuff
    and informationa about the actual user assets stored in the KDM API.

"""


# second party imports
from bson.objectid import ObjectId
import flask
import flask_login
import requests
import werkzeug

# kdm-manager imports
from app import app, login, utils


@login.user_loader
def load_user(_id):
    """ Used by flask_login when intializing the app. """
    return User(_id=_id)


class User(flask_login.UserMixin):


    def __init__(self, *args, **kwargs):
        """ Initializing a user requires a username and password. Upon init,
        the self.login() method is called, which sets self.token and the rest
        of the user object's attribs, etc.
        """

        self.logger = utils.get_logger()

        # set kwargs to self.whatever
        vars(self).update(kwargs)


    def login_to_api(self):
        """
        Part one of our two-part login deal.

        This first part hits the /login endpoint of the API and sets the
        self._id and self.token attribute, which is currently a JWT token.
        """

        # set the API endpoint and POST the username/password to it
        endpoint = app.config['API']['url'] + 'login'
        response = requests.post(
            endpoint,
            verify = app.config['API']['verify_ssl'],
            json = {
                'username': self.username,
                'password': self.password
            }
        )

        # if the response is bad, return false and the response
        if response.status_code != 200:
            return False, response
        else:
            user = response.json()
            self._id = ObjectId(user['_id'])
            self.token = user['access_token']
            return True


    def login_to_flask(self, form):
        """
        Second part of our two-step login.

        This part authenticates the user to flask_login and actually returns
        a flask response to the browser.
        """

        flask_login.login_user(self, remember=form.remember_me.data)

        # handle 'next' page if we're stopping them en route
        next_page = flask.request.args.get('next')
        if not next_page or werkzeug.urls.url_parse(next_page).netloc != '':
            next_page = flask.url_for('dashboard')

        # create a response, inject the token into the cookie and return
        redirect = flask.redirect(next_page)
        response = app.make_response(redirect)
        response.set_cookie('kdm-manager_token', user.token)
        return response


    def reset_password(self, new_password=None, recovery_code=None):
        """ Dials the API using 'recovery_code' and resets the user's password
        to 'new_password'. If successful, we then log the user in to the API
        with their new password, so we have a fresh/accurate token. """

        endpoint = app.config['API']['url'] + 'reset_password/reset'
        response = requests.post(
            endpoint,
            verify = app.config['API']['verify_ssl'],
            json = {
                'username': self.username,
                'password': new_password,
                'recovery_code': recovery_code
            }
        )

        if response.status_code == 200:
            self.password = new_password
            self.login_to_api()
        else:
            self.logger.error(response)
            return response.text



    #
    #   helpers
    #

    def get_id(self):
        """ Required for Flask-Login; also just a good idea. """
        return str(self._id)


    def has_token(self):
        """ Returns a bool representing whether the user currently has a JWT
        from the API. """
        user_id = getattr(self, '_id', None)
        user_token = getattr(self, 'token', None)
        if user_id is not None and user_token is not None:
            return True
        return False
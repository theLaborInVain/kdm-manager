"""

    The main routes for version four of the kdm-manager app.

    We DO NOT use blueprints and are intentionally tying to minimize endpoints
    in this app, so this is the main event.

"""

# standard library
import json

# second party imports
import flask
import flask_login
from bson import json_util

# kdm-manager imports
from app import app, models, utils
from app.forms import LoginForm, RegisterForm, ResetForm
from app.models import users


#   front matter
app.logger = utils.get_logger()



#
#   public static stuff
#
@app.route('/unauthorized/<status>')
def unauthorized(status):
    """ A place we dump people who attempt to access a resource they aren't
    authenticated for. """

    return flask.render_template(
        '/errors/default.html',
        status=status,
        message='Unauthorized',
        **app.config,
    ), int(status)



#
#   login / logout / register / reset
#
@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    """ Formerly the stand-alone AngularJS login app; now a part of the unified
    Flask application. """

#    flask.abort(500, 'This is the error!')
    # 1.) check to see if we're resetting a PW and redirect if so
    if flask.request.args.get('recover_password', None) is not None:
        return flask.redirect(
            flask.url_for(
                'reset_password',
                login=flask.request.args.get('login', None),
                recovery_code=flask.request.args.get('recovery_code', None),
            )
        )

    # 2.) if we're already logged in, forward us to the dash
    if flask_login.current_user.is_authenticated:
        msg = "'%s' is authenticated! Redirecting to dashboard..."
        app.logger.info(msg % flask_login.current_user)
        return flask.redirect(flask.url_for('dashboard'))

    # 3.) process the form, see if it validates
    login_form = LoginForm()
    if login_form.validate_on_submit():

        # try to authenticate the user against the API
        user = users.User(
            username=login_form.username.data,
            password=login_form.password.data
        )

        if user.login_to_api(): # returns True if the user authenticates
            return user.login_to_flask(login_form)
        flask.flash('Invalid username or password!')
        return flask.redirect(flask.url_for('login'))

    return flask.render_template(
        'login/sign_in.html',
        form=login_form,
        **app.config
    )


@app.route('/logout')
#@flask_login.login_required
def logout():
    """ Kills the flask_login 'session' and returns the user to the login. """
    flask_login.logout_user()
    return flask.redirect(flask.url_for('login'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    """ Processes the form for registering a new user with the API. """

    register_form = RegisterForm()

    if flask.request.method == 'POST' and register_form.validate():
        user = users.User(
            username=register_form.username.data,
            password=register_form.password.data
        )
        success, api_response = user.new()
        if success:
            flask.flash('New user registration successful! Please sign in...')
            return flask.redirect(flask.url_for('login'))

        flask.flash(api_response)

    # if we tried and failed validation, default in the email we tried
    if register_form.username.data is not None:
        register_form.default_login = register_form.username.data

    return flask.render_template(
        'login/register.html',
        form=register_form,
        **app.config
    )


@app.route('/reset_password/<user_login>/<recovery_code>', methods=['GET', 'POST'])
def reset_password(user_login, recovery_code):
    """ Processes the form for resetting a pw. """

    reset_form = ResetForm()
    reset_form.default_login = user_login    # bit of a jinja hack here

    if flask.request.method == 'POST' and reset_form.validate():
        user = users.User(username=reset_form.username.data)
        reset_result = user.reset_password(
            new_password=reset_form.password.data,
            recovery_code=recovery_code
        )

        # user.reset_password() logs the user in to the API, so we should have
        #an _id and a self.token now, which we can use to log in to flask

        if user.has_token():
            return user.login_to_flask(reset_form)
        flask.flash(reset_result)

    return flask.render_template(
        'login/reset_password.html',
        form=reset_form,
        **app.config
    )


@app.route('/about')
def login_about():
    """ This is currently just a flat page, but we might do some GDPR cookie
    complaiance stuff here eventually, so it's its own endpoint. """
    return flask.render_template(
        'login/about.html',
        **app.config
    )

@app.route('/help')
def login_help():
    """ Really simple; just renders the help and the controls for triggering
    a password reset. """
    return flask.render_template(
        'login/help.html',
        **app.config
    )


#
#   our API for the v4 webapp starts here
#

@app.route('/assets/<asset_module>')
def api_get_asset(asset_module):
    """ Returns dictionaries from our assets/ collection as JSON. """
    return flask.Response(
        response=json.dumps(
            models.get_asset_dicts(asset_module),
            default=json_util.default,
        ),
        status=200,
        mimetype='application/json'
    )




#
#   views!  (at least, that's what we used to call them)
#
@app.route('/almanac')
@flask_login.login_required
def almanac():
    """ A private webapp endpoint that acts as a hub for lore/release info. """
    return flask.render_template(
        'almanac/_base.html',
        **app.config
    )

@app.route('/dashboard')
@flask_login.login_required
def dashboard():
    ''' Renders the dashboard for the user. Includes default app references. '''
    msg = "Loading dashboard for %s"
    app.logger.info(msg % flask_login.current_user)
    prefs = users.Preferences()
    return flask.render_template(
        'dashboard/_base.html',
        PREFERENCES=prefs.dump(),     # because we edit them here
        **app.config
    )

@app.route('/new')
@flask_login.login_required
def new_settlement():
    ''' Renders the stand along view for creating a new settlement. '''
    return flask.render_template(
        'new_settlement.html',
        **app.config
    )

@app.route('/settlement/<settlement_oid>')
@flask_login.login_required
def settlement_sheet(settlement_oid):
    ''' Renders a settlement sheet, which is our main view in the v4 app. '''
    app.logger.info(
        '%s loading settlement %s' % (flask_login.current_user, settlement_oid)
    )
    return flask.render_template(
        'settlement_sheet/_base.html',
        **app.config
    )



#
#   error handling
#
@app.errorhandler(404)
def error_404(err):
    " Vanilla 404."
    app.logger.debug('[404] %s' % flask.request.url)
    return flask.render_template(
        '/errors/default.html',
        status=404,
        message='Not found',
        **app.config,
    ), 404

@app.errorhandler(500)
def error_500(error_msg):
    """ We sometimes throw a flask.abort(500). """
    app.logger.error('[500] %s' % flask.request.url)
    app.logger.error(error_msg)
    return flask.render_template(
        '/errors/default.html',
        status=500,
        message='Server explosion! %s' % error_msg,
        **app.config
    ), 500

@app.errorhandler(utils.Logout)
def force_logout(err):
    """ When the Flask error handler catches a utils.Logout, we need to log
    the user out immediately. """
    app.logger.error(err)
    return flask.redirect(flask.url_for('logout'))


#
#   Static and media routes for dev use!
#

@app.route('/favicon.ico')
def favicon():
    """ Returns the favicon when working in dev. """
    return flask.send_file('static/media/favicon.ico')

@app.route('/static/<sub_dir>/<path:path>')
def route_to_static(path, sub_dir):
    """ Returns the static dir when working in dev. """
    return flask.send_from_directory("static/%s" % sub_dir, path)

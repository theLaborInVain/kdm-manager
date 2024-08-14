"""

    Welcome to the oldest, dankest, most-badly-in-need-of-a-refactor part of the
    legacy webapp. This is where we have the pachinko-machine logic for handling
    active user sessions. Tread very carefully: code here is brittle af.

"""

from bson.objectid import ObjectId
import cgi
import Cookie
from datetime import datetime
import json
import jwt
import os
import random
import socket
import string
from string import Template
import sys
import traceback

# third party
import pymongo
import requests

import admin
import api
import assets
import html
import login
from utils import (
    deprecated,
    get_logger,
    get_user_agent,
    load_settings,
    mailSession,
    mdb,
    ymd,
    ymdhms,
)

settings = load_settings()
settings_private = load_settings('private')

#
#   decorators for Session() methods to help users report exceptions
#

def current_view_failure(func):
    """ Decorates the Session.current_view() method below, handling render
    failures according to our usability design. """

    def wrapper(self=None, *args, **kwargs):
        try:
            return func(self, *args, **kwargs)
        except Exception as e:
            err_msg = "Caught exception while rendering current view for %s!" % self.User
            self.logger.error(err_msg)
            self.logger.exception(e)
            tb = traceback.format_exc().replace("    ","&ensp;").replace("\n","<br/>")
            print html.meta.error_500.safe_substitute(msg=err_msg, exception=tb)

            self.log_out()
            self.email_render_error(traceback=tb)

            sys.exit(255)

    return wrapper

def process_params_failure(func):
    """ Decorates the Session.process_params() method below, handling parameter
    processing errors in a way that encourages users to report. """

    def wrapper(self=None, *args, **kwargs):
        try:
            return func(self, *args, **kwargs)
        except Exception as e:
            err_msg = "Caught exception while processing parameters for %s!" % self.User
            self.logger.error(err_msg)
            self.logger.exception(e)
            tb = traceback.format_exc().replace("    ","&ensp;").replace("\n","<br/>")
            print html.meta.error_500.safe_substitute(msg=err_msg, exception=tb, params=str(self.params))

            self.log_out()
            self.email_render_error(traceback=tb)

            sys.exit(255)

    return wrapper


def session_init_failure(func):
    """ Wraps the session.__new__() method and emails failures. """

    def wrapper(self=None, *args, **kwargs):
        try:
            return func(self, *args, **kwargs)
        except Exception as e:
            self.logger.exception(e)
            tb = traceback.format_exc().replace("    ","&ensp;").replace("\n","<br/>")
            err_msg = "Session __init__() failure!"
            p_str = "No CGI params!"
            if hasattr(self, 'params'):
                p_str = str(self.params)
            print html.meta.error_500.safe_substitute(msg=err_msg, exception=tb, params=p_str)
            sys.exit(255)
    return wrapper


#
#   Session class object!
#

class Session:
    """ The properties of a Session object are these:

        self.params     -> a cgi.FieldStorage() object
        self.session    -> a mdb session object
        self.Settlement -> an assets.Settlement object
        self.User       -> an assets.User object

    """

    def __repr__(self):
        return str(self.session["_id"])

    @session_init_failure
    def __init__(self, params={}):
        """ Initialize a new Session object."""
        self.logger = get_logger()

        # these are our session attributes. Declare them all here
        self.params = params
        self.session = None
        self.Settlement = None
        self.User = None
        self.set_cookie = False

        #
        #   special session types
        #

        # we're not processing params yet, but if we have a log out request, we
        #   do it here, while we're initializing a new session object.
        if "remove_session" in self.params:
            user = mdb.users.find_one(
                {
                    "current_session": ObjectId(
                        self.params["remove_session"].value
                    )
                }
            )

            if user is not None:
                self.User = assets.User(user_id=user["_id"], session_object={"_id": 0})
                self.User.mark_usage("signed out")

            if 'login' in self.params:
                admin.remove_session(self.params["remove_session"].value, self.params["login"].value)
            else:
                admin.remove_session(self.params["remove_session"].value, "webapp_error")

        # ok, if this is a recovery request, let's try to do that
        if 'recovery_code' in self.params:
            self.logger.info("Password Recovery Code sign-in initiated!")
            user = mdb.users.find_one(
                {'recovery_code': self.params["recovery_code"].value}
            )
            if user is None:
                msg = "Password Recovery Code not found. Aborting attempt."
                self.logger.info(msg)
            else:
                msg = "Rendering Password Recovery controls for '%s'"
                self.logger.info(msg, user["login"])
                login.render(
                    "reset", user["login"], self.params['recovery_code'].value
                )
                self.session = "PASSWORD_RESET"
                return

        #
        #   normal session types
        #

        #
        #   initialize!
        #

        # 1.) try to set the session ID from the cookie
        self.cookie = Cookie.SimpleCookie(os.environ.get("HTTP_COOKIE"))
        if "session" in self.cookie:
            try:
                session_id = ObjectId(self.cookie['session'].value)
            except Exception as e:
                self.logger.error("Session ID does not appear to be an OID!")
                self.logger.error(e)
                for k, v in self.cookie.iteritems():
                    self.logger.error("%s -> %s" % (k,v))
                session_id = None
        else:
            session_id = None

        # 2.) determine if creds are present
        creds_present = False
        if 'login' in self.params and 'password' in self.params:
            creds_present = True

        #
        #   do stuff!
        #

        # default sign in method; 
        def sign_in():
            """ Private DRYness method for quickly logging in with params. """
            if 'login' in self.params and 'password' in self.params:
                self.AuthObject = login.AuthObject(self.params)
                try:
                    self.User, self.session = self.AuthObject.authenticate()
                except TypeError:
                    raise AttributeError("User login '%s' not found in MDB!" % self.params['login'].value)
                self.set_cookie=True

        if session_id is not None:
            try:
                self.session = mdb.sessions.find_one({"_id": session_id})
            except pymongo.errors.ServerSelectionTimeoutError:
                self.logger.error('The database is unavailable!')
                self.session = None
            if self.session is None:
                sign_in()
            else:
                user_object = mdb.users.find_one({"current_session": session_id})
                self.User = assets.User(user_object["_id"], session_object=self)
        elif self.cookie is not None and 'Session' not in self.cookie.keys() and creds_present:
            sign_in()
        elif self.cookie is None and creds_present:
            sign_in()
        else:
#            self.logger.error("Error attempting to process cookie!")
#            self.logger.error(self.cookie)
            sign_in()

        if self.session is not None:

            token_check = False
            try:
                token_check = api.check_token(self)
            except requests.ConnectionError:
                self.log_out()
                self.session = None

            if not token_check:
#                self.logger.debug("JWT Token expired! Attempting to refresh...")
                r = api.refresh_jwt_token(self)
                if r.status_code == 401:
                    self.log_out()
                    self.session = None



    def save(self, verbose=True):
        """ Generic save method. """
        mdb.sessions.save(self.session)
        if verbose:
            self.logger.debug("[%s] saved changes to session in mdb!" % (self.User))


    def log_out(self):
        """ For when the session needs to kill itself. """
        warn = "Ending session for '%s' via admin.remove_session()."
        self.logger.debug(warn)
        admin.remove_session(self.session["_id"], "admin")


    def new(self, login, password):
        """ Creates a new session. Needs a valid user login and password..

        Updates the session with a User object ('self.User') and a new Session
        object ('self.session'). """

        user = mdb.users.find_one({"login": login})
        mdb.sessions.remove({"login": user["login"]})

        # new! get a JWT token and add it to your sesh so that your sesh can be
        # used to add it to your cookie

        token = api.get_jwt_token(login, password)

        if token:
            warn = "[%s (%s)] JWT token retrieved!"
            self.logger.debug(warn % (user["login"], user["_id"]))

        session_dict = {
            "login": login,
            "created_on": datetime.now(),
            "created_by": user["_id"],
            "current_view": "dashboard",
            "user_agent": {
                "is_mobile": get_user_agent().is_mobile,
                "browser": get_user_agent().browser
            },
            "access_token": token,
        }

        session_id = mdb.sessions.insert(session_dict)
        self.session = mdb.sessions.find_one({"_id": session_id})

        # update the user with the session ID
        user["current_session"] = session_id
        mdb.users.save(user)

        self.User = assets.User(user["_id"], session_object=self)

        return session_id   # passes this back to the html.create_cookie_js()


    def get_current_view(self):
        """ Returns current view as a string. Also sets the attribute. """

        if self.session is None:
            return "sign-in / none"

        if "current_view" in self.session.keys():
            self.current_view = self.session["current_view"]
            return self.current_view
        elif hasattr(self, "current_view"):
            return self.current_view
        else:
            return None


    def change_current_view(self, target_view, asset_id=False):
        """ Convenience function to update a session with a new current_view.

        'asset_id' is only mandatory if using 'view_survivor' or
        'view_settlement' as the 'target_view'.

        Otherwise, if you're just changing the view to 'dashbaord' or whatever,
        'asset_id' isn't mandatory.
        """

        self.session["current_view"] = target_view

        if asset_id:
            asset = ObjectId(asset_id)
            self.session["current_asset"] = asset
            if target_view in ["view_campaign", 'view_settlement']:
                self.session["current_settlement"] = asset

        self.save()
        self.session = mdb.sessions.find_one(self.session["_id"])

        return "changed view to '%s'" % target_view


    def change_current_view_to_asset(self, view):
        """ Changes the current view to a view of a user asset. Returns a
        string meant to be logged as a user action. """

        try:
            a = ObjectId(self.params[view].value)
        except Exception as e:
            err = "CGI param '%s' must be a valid Object ID!" % view
            self.logger.error(err)
            raise Exception('Invalid CGI parameter! %s' % e)

        if view == "view_survivor":
            asset = mdb.survivors.find_one({"_id": a})
            asset_sum = "%s [%s]" % (asset["name"], asset["sex"])
        elif view in ["view_campaign", "view_settlement"]:
            asset = mdb.settlements.find_one({"_id": a})
            asset_sum = "%s" % (asset["name"])
        else:
            err = "[%s] view could not be changed to asset '%s'"
            self.logger.error(err % (self.User,a))

        self.change_current_view(view, asset_id=a)

        msg = "changed view to '%s' | %s | %s" % (view, a, asset_sum)
        self.logger.debug(msg)
        return msg


    def report_error(self):
        """ Uses attributes of the session, including self.params, to create an
        error report email. """

        self.logger.debug("[%s] is entering an error report!" % self.User)
        admins = settings.get("application","admin_email").split(",")

        M = mailSession()
        email_msg = html.meta.error_report_email.safe_substitute(
            user_email=self.User.user["login"],
            user_id=self.User.user["_id"],
            body=self.params["body"].value.replace("\n","<br/>")
        )
        M.send(
            recipients=admins,
            html_msg=email_msg,
            subject="KDM-Manager Error Report",
            reply_to=self.User.user["login"],
        )
        self.logger.warn("[%s] Error report email sent!" % self.User)


    def email_render_error(self, traceback=None):
        """ Uses the attributes of the session to send an email when a user's
        current view fails to render. """

        admins = settings.get("application","admin_email").split(",")


        session_as_html = "<br/>".join(
            ["&ensp; %s -> %s" % (k,v) for k,v in self.session.iteritems()]
        )

        M = mailSession()
        email_msg = html.meta.view_render_fail_email.safe_substitute(
            user_email=self.User.user["login"],
            user_id=self.User.user["_id"],
            exception=traceback,
            hostname=socket.gethostname(),
            error_time=datetime.now(),
            session_obj=session_as_html,
        )
        M.send(
            recipients=admins,
            html_msg=email_msg,
            subject="KDM-Manager Render Failure! [%s]" % socket.gethostname(),
        )
        self.logger.warn("[%s] Current view render failure email sent!" % self.User)


    @process_params_failure
    def process_params(self, user_action=None):
        """ All cgi.FieldStorage() params passed to this object on init
        need to be processed. This does ALL OF THEM at once. """

        #
        #   dashboard-based, user operation params
        #

        # do error reporting
        if "error_report" in self.params and "body" in self.params:
            self.report_error()

        #
        #   change view operations, incl. with/without an asset
        #

        # change to a generic view without an asset
        if "change_view" in self.params:
            target_view = self.params["change_view"].value
            user_action = self.change_current_view(target_view)

        # change to a view of an asset
        for p in ["view_campaign", "view_settlement", "view_survivor"]:
            if p in self.params:
                user_action = self.change_current_view_to_asset(p)


        #
        #   settlement operations - everything below uses user_asset_id
        #       which is to say that all forms that submit these params use
        #       the asset_id=mdb_id convention.

        user_asset_id = None
        if "asset_id" in self.params:
            user_asset_id = ObjectId(self.params["asset_id"].value)

        self.User.mark_usage(user_action)
        self.get_current_view()


    @current_view_failure
    def current_view_html(self, body=None):
        """ This func uses session's 'current_view' attribute to render the html
        for that view.

        A view's HTML does NOT include header/footer type elements. Rather, it
        involes a container element that contains all the user controls, and
        then, outside of/beneath the container element, all of the 'modal'
        UI stuff that a user might need in a view.

        In this method then, we use the current view to figure out what to
        put in the container and what to append to the container.

        The whole thing is decorated in a function that captures failures and
        asks users to report them (and kills their session, logging them out, so
        they don't get stuck in a state where they can't stop re-creating the
        error, etc.
        """

        self.get_current_view()

        include_ui_templates = True

        # start the container
        output = html.meta.start_container % getattr(self, 'current_view', None)

        # now get us some HTML
        if self.current_view == "dashboard":
            body = "dashboard"
            include_ui_templates = ['debugger']
            output += html.get_template('dashboard')

        elif self.current_view == "new_settlement":
            body = 'create_new_settlement'
            include_ui_templates = ['nav', 'help', 'report_error']
            output += html.get_template('new_settlement.html')

        elif self.current_view == "view_campaign":
            body = 'view_campaign_summary'
            output += html.get_template('campaign_summary')

        elif self.current_view == "view_settlement":
            body = 'view_settlement_sheet'
            output += html.get_template('settlement_sheet')

        elif self.current_view == "view_survivor":
            body = 'view_survivor_sheet'
            output += html.get_template('survivor_sheet')

        else:
            err = "[%s] requested unhandled view '%s'"
            self.logger.error(err % (self.User, self.current_view))
            raise Exception("Unknown view requested! '%s'" % self.current_view)

        # now close the container
        output += html.meta.close_container

        # add UI templates
        if include_ui_templates:

            # allow arbitrary lists of templates to include
            template_list = settings.get('application', 'ui_templates').split(',')
            if isinstance(include_ui_templates, list):
                template_list = include_ui_templates

            for t in template_list:
                output += html.get_template(t.strip())

        # finally, do a single, monster variable substitution pass:
        output = Template(output).safe_substitute(
            api_url = api.get_api_url(),
            application_version = settings.get("application","version"),
            application_age_rough_years = (
                datetime.now() - datetime(2015, 11, 10)
            ).days / 365,
            user_id=self.User.user['_id'],
            user_login = self.User.user["login"],
            settlement_id = self.session.get('current_settlement', None),
            survivor_id = self.session.get('current_asset', None),
            current_session = self.session.get('_id', None),
        )

        return output, body

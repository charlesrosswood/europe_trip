__author__ = 'cwod'


# from flask.ext.wtf import Form
from wtforms import Form, PasswordField, StringField, validators
import uuid
import hashlib


class RegistrationForm(Form):
    username = StringField('Username', [validators.Length(min=4, max=25)])
    email = StringField('Email Address', [validators.Length(min=6, max=35)])
    password = PasswordField('New Password', [
        validators.DataRequired(),
        validators.EqualTo('confirm', message='Passwords must match')
    ])
    confirm = PasswordField('Repeat Password')

    def validate_form(self, db):
        valid = super(RegistrationForm, self).validate()
        if valid:
            user_exists = db.select_from_table('users', columns=['username'],
                where="username='%s'" % (
                self.username.data))
            if user_exists['result']:
                valid = False
        return valid


class LoginForm(Form):
    username = StringField('Username', [validators.Length(min=4, max=25)])
    password = PasswordField('Password')



class User(object):

    def __init__(self, username, password, salt=None):
        self.username = username
        self.salt = self.get_salt(salt)
        self.password_hash = self.hash_password(password, self.salt)

    @staticmethod
    def hash_password(password, salt):
        if isinstance(password, str):
            password = password.encode('utf-8')
        if isinstance(salt, str):
            salt = salt.encode('utf-8')

        return hashlib.sha512(salt + password).hexdigest()

    def get_salt(self, salt=None):
        if salt is not None:
            self.salt = salt
        elif hasattr(self, 'salt'):
            if self.salt is None:
                self.salt = uuid.uuid4().hex
        else:
            self.salt = uuid.uuid4().hex
        return self.salt

    # TODO: work out how to get a user, validate them and stuff, probably handled by Flask anyway.
    def get_user_from_db(self, db):
        where_string = ["username='%s'" % (), "password_hash='%s'"]
        # db.select_from_table('users', where=)

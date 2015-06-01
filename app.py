__author__ = 'cwod'

from flask import Flask
from flask import render_template
from flask import redirect
from flask import url_for
from flask.ext.login import LoginManager
from flask.ext.login import login_required
from flask.ext.login import login_user
import py_modules.db_config as database
import json
from flask import request
from flask import abort
import platform
import os
import hashlib
import uuid
import py_modules.user_login_registration as user_login_registration

if platform.system() in ['Windows', 'Darwin']:  # local dev server
    _HOST_ = 'localhost'
    _DBNAME_ = 'postgres'
    _USER_ = 'cwod'
    _PASSWORD_ = ''

    _DEBUG_ = True
else:  # heroku
    db_url = os.environ['DATABASE_URL']

    _HOST_ = db_url.split('@')[1].split(':')[0]
    _DBNAME_ = db_url.split('/')[-1]
    _USER_ = db_url.split('//')[1].split(':')[0]
    _PASSWORD_ = db_url.split(':')[2].split('@')[0]
    _PORT_ = int(db_url.split(':')[-1].split('/')[0])

    _DEBUG_ = False

db = database.DatabaseConfig(host=_HOST_, dbname=_DBNAME_, user=_USER_,
    password=_PASSWORD_)

app = Flask(__name__)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.request_loader
def load_user(request):
    """
    This function is to load a user if the credentials match the DB

    :param request:
    :return:
    """
    # the token is either the Authorization header or...
    token = request.headers.get('Authorization')
    if token is None:
        # ...the token is a URL parameter
        token = request.args.get('token')

    if token is not None:
        username,password = token.split(':')

        password_salt = uuid.uuid4().hex
        password_hash = hashlib.sha512(password_salt + password).hexdigest()

        where_clauses = ['password hash="%s"' % (password_hash,), 'username="%s"' % (username,)]
        user_response = db.select_from_table('users', where=where_clauses)
        print(user_response)

        #TODO do something with makeing a User object if necessary
        if user_response is not None:
            return user_response

    return None

def decode_request(request_obj):
    con_type = request_obj.content_type
    charset = 'charset='

    start_index = con_type.lower().find(charset)
    end_index = con_type.lower().find(';', start_index + len(charset))
    if end_index == -1:
        end_index = len(con_type)

    if start_index > -1:  # found a charset
        required_codec = con_type[start_index + len(charset):end_index]
    else:  # default utf-8
        required_codec = 'utf-8'

    return request.data.decode(required_codec)

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = user_login_registration.RegistrationForm(request.form)
    if request.method == 'POST' and form.validate_form(db):

        user = user_login_registration.User(username=form.username.data,
            password=form.password.data)
        db.insert_into_table('users', columns=['username', 'password_hash', 'password_salt'],
            values=[[user.username, user.password_hash, user.salt]])

        return redirect(url_for('login'))
    return render_template('login_register/register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Here we use a class of some kind to represent and validate our
    # client-side form data. For example, WTForms is a library that will
    # handle this for us.
    form = user_login_registration.LoginForm()
    if form.validate():
        print(form.__dict__)
        # Login and validate the user.
        login_user(user)

        next = request.args.get('next')
        print(next)
        if not next_is_valid(next):
            return abort(400)

        return redirect(next or url_for('index'))
    return render_template('login_register/login.html', form=form)

@app.route('/index', methods=['GET'])
@login_required
def index():
    return render_template('index.html'), 200

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        print(request.files)
        file = request.files['fileField']
        print(file)
        path_to_file = '/Users/cwod/Documents/GitHub/europe_trip3/' + file.filename
        print('path_to_file', path_to_file)
        file.save('/Users/cwod/Documents/GitHub/europe_trip3/' + file.filename)
        return json.dumps(True), 200
    elif request.method == 'GET':
        return render_template('upload.html'), 200
    else:
        abort(405)

@app.route('/map', methods=['GET'])
def map():
    return render_template('map.html'), 200


# RESTful database methods
# TODO: Fix for SQL injection
@app.route('/read/<tablename>', methods=['GET'])
@app.route('/read/<tablename>/<id>', methods=['GET'])
def read(tablename, id=None):
    if id is None or str(id).lower() == 'null':
        db_response = db.select_from_table(tablename=tablename)
        return json.dumps(db_response), db_response['status']
    else:
        where_string = 'WHERE id=%s' % (id,)
        try:
            db_response = db.select_from_table(tablename=tablename, where=where_string)
            return json.dumps(db_response), db_response['status']

        except:  # TODO: catch all exception - bad
            abort(404)


@app.route('/write/<tablename>', methods=['POST'])
def write(tablename):
    """
    The POST request should be sent to: http://<address of server>/write/<table name to write to>
    The POST request should have a payload body like this:

    {
        'columns': <list> of strings of column names to write -- OPTIONAL,
        'values': <list of <list>> of values to write (e.g. [[1,'foo',3],[2,'bar',4]]-- REQUIRED
    }

    :return:
    """
    payload = json.loads(decode_request(request))
    print(payload)
    try:
        if 'columns' in payload.keys():
            columns = payload['columns']
        else:
            columns = None
        values = payload['values']

        insert_success = db.insert_into_table(
            tablename=tablename,
            values=values,
            columns=columns
        )

        return json.dumps(insert_success), insert_success['status']

    except:  # TODO: catch all exception!
        abort(500)

@app.route('/save-route', methods=['POST'])
def save_route():
    request_data = json.loads(decode_request(request))
    print(request_data)

    return json.dumps(True), 201


# Handling HTTP errors
@app.errorhandler(400)
def forbidden(e):
    return render_template('errors/400.html'), 400

@app.errorhandler(403)
def forbidden(e):
    return render_template('errors/403.html'), 403

@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404

@app.errorhandler(405)
def method_not_allowed(e):
    print('error', e)
    return render_template('errors/405.html'), 405

@app.errorhandler(410)
def gone(e):
    return render_template('errors/410.html'), 410

@app.errorhandler(500)
def server_error(e):
    return render_template('errors/500.html'), 500

# if the app is run directly from command line, hit this function
if __name__ == '__main__':
    app.secret_key = 'qwertyuiop'
    app.run(debug=_DEBUG_)
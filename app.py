__author__ = 'cwod'

from flask import Flask
from flask import render_template
import py_modules.db_config as database
import json
from flask import request
from flask import abort
import platform
import os
import py_modules.users as users

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

@app.route('/index', methods=['GET'])
def index():
    return render_template('index.html'), 200

@app.route('/upload', methods=['GET'])#, 'POST'])
def upload():
    all_users = users.User.get_all_users_from_db(db)
    return render_template('upload.html', context={'users': all_users}), 200

@app.route('/view-uploads', methods=['GET'])
def view_uploads():
    user_uploads = users.User.get_all_users_uploads(db)

    def find_photo(users_uploads):
        for user in users_uploads:
            if user['photo_uploads']:
                for photo in user['photo_uploads']:
                    return photo['image_url']
            else:
                return None
    init_photo = find_photo(user_uploads)

    context = {
        'users': user_uploads,
        'init_photo': init_photo
    }
    return render_template('view_uploads.html', context=context)

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
    # TODO: make sure we return the id of the inserted row

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
        print(insert_success)
        return json.dumps(insert_success), insert_success['status']

    except:  # TODO: catch all exception!
        abort(500)

@app.route('/save-route', methods=['GET'])
def save_route():
    # request_data = json.loads(decode_request(request))
    # print(request_data)

    from datetime import datetime
    now = datetime.now()
    print(now)
    db.insert_into_table('geolocations', [[now]], ['entry_timestamp'],)
    return json.dumps(True), 201


# Handling HTTP errors
@app.errorhandler(400)
def forbidden(e):
    return render_template('errors/400.html'), 400

@app.errorhandler(403)
def bad_request(e):
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
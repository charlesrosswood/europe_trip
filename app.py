__author__ = 'cwod'


from flask import Flask, render_template
import py_modules.db_config as database
import json
from flask import request
from flask import abort
import platform
import os


if platform.system() in ['Windows', 'Darwin']:
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
        print('here')
    else:  # default utf-8
        required_codec = 'utf-8'

    return request.data.decode(required_codec)

@app.route('/', methods=['GET'])
def index():
    server_address = request.remote_addr
    return render_template('landing_page.html'), 200

@app.route('/read', methods=['GET'])
def read():
    return json.dumps(db.select_from_table(tablename='testing')), 200


@app.route('/write', methods=['POST'])
def write():
    return json.dumps(db.insert_into_table(
        tablename='testing',
        columns=['name', 'value', 'number'],
        values=[('testing12234', 'that thing132'),('testing2323', 'that thing4332', 12344)]
    )), 200

@app.route('/save-route', methods=['POST'])
def save_route():
    request_data = json.loads(decode_request(request))
    print(request_data)

    return json.dumps(True), 200

# Handling HTTP errors
@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404

@app.errorhandler(403)
def forbidden(e):
    return render_template('errors/403.html'), 403

@app.errorhandler(405)
def forbidden(e):
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
    app.run(debug=_DEBUG_)
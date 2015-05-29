__author__ = 'cwod'


from flask import Flask, render_template
import py_modules.db_config as database
import json
from flask import request
import platform
import os


if platform.system() in ['Windows', 'Darwin']:
    _HOST_ = 'localhost'
    _DBNAME_ = 'postgres'
    _USER_ = 'cwod'
    _PASSWORD_ = ''
else:  # heroku
    _HOST_ = os.environ['DATABASE_URL']
    _DBNAME_ = 'postgres'
    _USER_ = 'cwod'
    _PASSWORD_ = ''

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
    return render_template('landing_page.html', server_address = server_address)

@app.route('/read', methods=['GET'])
def read():
    return json.dumps(db.select_from_table(tablename='testing'))


@app.route('/write', methods=['POST'])
def write():
    return json.dumps(db.insert_into_table(
        tablename='testing',
        columns=['name', 'value', 'number'],
        values=[('testing12234', 'that thing132'),('testing2323', 'that thing4332', 12344)]
    ))

@app.route('/save-route', methods=['POST'])
def save_route():
    request_data = json.loads(decode_request(request))
    print(request_data)

    return json.dumps(True)

if __name__ == '__main__':
    app.run(debug=True)
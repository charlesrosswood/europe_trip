__author__ = 'cwod'

from flask import Flask
from flask import request
from py_modules.views import DatabaseApis
import platform
import os
import py_modules.views as views
import py_modules.error_views as error_views

if platform.system() in ['Windows', 'Darwin']:  # local dev server
    _HOST_ = 'localhost'
    _DBNAME_ = 'cwod'
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

db = DatabaseApis(host=_HOST_, dbname=_DBNAME_, user=_USER_,
    password=_PASSWORD_)

app = Flask(__name__)


# Views that render templates
@app.route('/', methods=['GET'])
def map_posts(*args, **kwargs):
    return views.TemplateRenderers.map_posts(db)

@app.route('/upload', methods=['GET'])#, 'POST'])
def upload(*args, **kwargs):
    return views.TemplateRenderers.upload(db)


# RESTful views that act as APIs
@app.route('/get-updated-posts', methods=['GET'])
def update_posts():
    return db.get_updated_posts()

# RESTful database methods
# TODO: Fix for SQL injection
@app.route('/read/<tablename>', methods=['GET'])
def read(tablename):
    """
    pass id and columns in as a query parameter
    :param tablename:
    :return:
    """
    return db.read(request, tablename)

@app.route('/write/<tablename>', methods=['POST'])
def write(tablename):
    return db.write(request, tablename)

@app.route('/update/<tablename>', methods=['PUT'])
def update(tablename):
    return db.update(request, tablename)

@app.route('/delete/<tablename>', methods=['DELETE'])
def delete(tablename):
    return db.delete(request, tablename)

# Handling HTTP errors
@app.errorhandler(400)
def forbidden(e):
    return error_views.ErrorRenderers.forbidden(e)

@app.errorhandler(403)
def bad_request(e):
    return error_views.ErrorRenderers.bad_request(e)

@app.errorhandler(404)
def page_not_found(e):
    return error_views.ErrorRenderers.page_not_found(e)

@app.errorhandler(405)
def method_not_allowed(e):
    return error_views.ErrorRenderers.method_not_allowed(e)

@app.errorhandler(410)
def gone(e):
    return error_views.ErrorRenderers.gone(e)

@app.errorhandler(500)
def server_error(e):
    return error_views.ErrorRenderers.server_error(e)

# if the app is run directly from command line, hit this function
if __name__ == '__main__':
    app.run(debug=_DEBUG_)

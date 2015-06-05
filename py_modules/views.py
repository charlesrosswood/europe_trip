__author__ = 'cwod'

from flask import render_template
import py_modules.users as users
import simplejson as json
from flask import abort


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

    return request_obj.data.decode(required_codec)

class TemplateRenderers(object):
    """
    Static class to render templates from views call

    """

    @staticmethod
    def map_posts(*args, **kwargs):
        return render_template('map_posts.html'), 200

    @staticmethod
    def index(*args, **kwargs):
        return render_template('index.html'), 200

    @staticmethod
    def upload(db):
        all_users = users.User.get_all_users_from_db(db)
        return render_template('upload.html', context={'users': all_users}), 200

    @staticmethod
    def view_uploads(db):
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

    @staticmethod
    def map(*args, **kwargs):
        return render_template('map.html'), 200


class RestfulApis(object):
    """

    """

    @staticmethod
    def read(db, tablename, id=None):
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

    @staticmethod
    def write(db, tablename):
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

    @staticmethod
    def save_route(db):
        # request_data = json.loads(decode_request(request))
        # print(request_data)

        from datetime import datetime
        now = datetime.now()
        print(now)
        db.insert_into_table('geolocations', [[now]], ['entry_timestamp'],)
        return json.dumps(True), 201

    @staticmethod
    def update_posts(db):
        user_uploads = users.User.get_all_users_uploads(db)
        context = {
            'users': user_uploads
        }

        print(user_uploads)
        return json.dumps(context), 200
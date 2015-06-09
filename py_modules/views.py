__author__ = 'cwod'

from flask import render_template
from flask import Response
import py_modules.users as users
import simplejson as json
from operator import itemgetter
import time


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
    def map_posts(db):
        user_uploads = users.User.get_all_users_uploads(db)
        user_dict = {}
        all_posts = []

        for user in user_uploads:
            print(user)
            all_posts.extend(user['posts'])
            user_dict.update({user['user_id']: user})

        all_posts = sorted(all_posts, key=itemgetter('post_timestamp'), reverse=True)

        for post in all_posts:
            timestamp_ms = post['post_timestamp']
            human_readable_date = time.strftime('%d-%m-%Y %H:%M:%S', time.gmtime(timestamp_ms /
                                                                              1000.0))
            post['date'] = human_readable_date
        return render_template('map_posts.html', context={'posts': all_posts, 'users':
            user_dict}), 200

    @staticmethod
    def upload(db):
        all_users = users.User.get_all_users_from_db(db)

        return render_template('upload.html', context={'users': all_users}), 200


class RestfulApis(object):
    """

    """

    @staticmethod
    def read(db, tablename, columns=None, id=None):
        if id is not None:
            where_string = 'id=%s' % (id,)
        else:
            where_string = None

        db_response = db.select_from_table(tablename=tablename, where=where_string,
            columns=columns)

        response_object = Response(response=json.dumps(db_response), status=db_response[
            'status'], mimetype='application/json')

        # response_object.headers['Test'] = 1234567890  # this is how you add headers
        return response_object

    @staticmethod
    def write(request, db, tablename):
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
        if 'columns' in payload.keys():
            columns = payload['columns']
        else:
            columns = None
        values = payload['values']

        db_response = db.insert_into_table(
            tablename=tablename,
            values=values,
            columns=columns
        )

        response_object = Response(response=json.dumps(db_response), status=db_response[
            'status'], mimetype='application/json')

        # response_object.headers['Test'] = 1234567890  # this is how you add headers
        return response_object

    @staticmethod
    def update(request, db, tablename):
        """
        The PUT request should have body parameters like:
        {
            'set_clauses': <list> of strings of the format: <column name>=<new value>,
            'where_clauses': <list> of strings of the format: <column name>=<new value>,
        }
        :param request:
        :param db:
        :param tablename:
        :return:
        """
        payload = json.loads(decode_request(request))
        if 'where_clauses' in payload.keys():
            where_clauses = payload['where_clauses']
        else:
            where_clauses = None

        db_response = db.update_table(tablename, payload['set_clauses'],
            where_clauses=where_clauses)

        response_object = Response(response=json.dumps(db_response), status=db_response[
            'status'], mimetype='application/json')

        return response_object
        # return json.dumps(db_response), db_response['status']

    @staticmethod
    def update_posts(db):
        user_uploads = users.User.get_all_users_uploads(db)
        context = {
            'users': user_uploads
        }

        response_object = Response(response=json.dumps(context), status=200,
            mimetype='application/json')

        return response_object


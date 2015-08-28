#!/usr/bin/python3
# -*- coding: utf-8 -*-

__author__ = 'cwod'

from flask import render_template
from flask import Response
from flask import url_for
from flask import abort
import py_modules.users as users
from py_modules.db_config import DatabaseConfig
import simplejson as json
from operator import itemgetter
import time
import hashlib


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
            all_posts.extend(user['posts'])
            user_dict.update({user['user_id']: user})

        all_posts = sorted(all_posts, key=itemgetter('post_timestamp'), reverse=True)

        for post in all_posts:
            timestamp_ms = post['post_timestamp']
            human_readable_date = time.strftime('%d-%m-%Y %H:%M', time.gmtime(timestamp_ms /
                                                                              1000.0))
            post['date'] = human_readable_date
        print('all posts:::', all_posts)

        return render_template('map_posts.html', context={'posts': all_posts, 'users':
            user_dict}), 200

    @staticmethod
    def upload(db):
        all_users = users.User.get_all_users_from_db(db)

        return render_template('upload.html', context={'users': all_users}), 200

    @staticmethod
    def view_saved():
        return render_template('view_saved.html'), 200


class DatabaseApis(DatabaseConfig):
    """

    """
    def __init__(self, host, dbname, user='postgres', password='postgres', port=5432):
        super(DatabaseApis, self).__init__(host, dbname, user, password, port)
        self.auth_token = '3d2227fad9db32c754b54aa5b601e6bd9c3262d042e0986450e6f291'

    def read(self, request, tablename):
        columns = request.args.get('columns', '').split(',')
        if len(columns) == 1 and not columns[0]:
            columns = None

        where_list = []
        for key in request.args:
            if key != 'columns':
                value = request.args.get(key, '')
                if value.lower() == 'null' or value.lower() == 'none':
                    value = None
                where_list.append('%s=%s' % (key, value))
        where_list = [where.replace('"', "'") for where in where_list]

        db_response = self.select_from_table(tablename=tablename, where=where_list,
            columns=columns)

        response_object = Response(response=json.dumps(db_response), status=db_response[
            'status'], mimetype='application/json')

        # response_object.headers['Test'] = 1234567890  # this is how you add headers
        return response_object

    def write(self, request, tablename):
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
        # test for authorisation
        if self._is_user_authorised(payload.get('auth_token', '')):
            if 'columns' in payload.keys():
                columns = payload['columns']
            else:
                columns = None
            values = payload['values']

            db_response = self.insert_into_table(
                tablename=tablename,
                values=values,
                columns=columns
            )

            response_object = Response(response=json.dumps(db_response), status=db_response[
                'status'], mimetype='application/json')

            # response_object.headers['Test'] = 1234567890  # this is how you add headers
            return response_object
        else:
            abort(401)

    def update(self, request, tablename):
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
        if self._is_user_authorised(payload.get('auth_token', '')):
            if 'where_clauses' in payload.keys():
                where_clauses = payload['where_clauses']
            else:
                where_clauses = None

            db_response = self.update_table(tablename, payload['set_clauses'],
                where_clauses=where_clauses)

            response_object = Response(response=json.dumps(db_response), status=db_response[
                'status'], mimetype='application/json')

            return response_object
        else:
            abort(401)
        # return json.dumps(db_response), db_response['status']

    def delete(self, request, tablename):
        """

        :param request:
        :param db:
        :param tablename:
        :return:
        """
        where_list = []
        for key in request.args:
            if key != 'columns':
                value = request.args.get(key, '')
                if value.lower() == 'null' or value.lower() == 'none':
                    value = None
                where_list.append('%s=%s' % (key, value))
        where_list = [where.replace('"', "'") for where in where_list]

        db_response = self.delete_from_table(tablename=tablename, where_clauses=where_list)

        response_object = Response(response=json.dumps(db_response), status=db_response[
            'status'], mimetype='application/json')

        # response_object.headers['Test'] = 1234567890  # this is how you add headers
        return response_object

    def get_updated_posts(self):
        user_uploads = users.User.get_all_users_uploads(self)
        for user in user_uploads:
            avatar_filename = '.'.join([user['username'],'png'])
            user_avatar_url = url_for('static', filename='images/avatars/%s' % (avatar_filename,))
            user['avatar_url'] = user_avatar_url

        context = {
            'users': user_uploads
        }

        print(context)
        response_object = Response(response=json.dumps(context), status=200,
            mimetype='application/json')

        return response_object

    def _is_user_authorised(self, auth_token):
        return auth_token == self.auth_token

    def authorise_user(self, request):
        """
        Use this to log a user in
        """
        payload = json.loads(decode_request(request))
        username = payload.get('username', '')

        password = payload.get('password', '').encode('utf-8')
        password_hash = hashlib.sha224(password).hexdigest()

        print(username, password_hash)

        where_clause = ["username='%s'" % str(username), "password_hash='%s'" % str(password_hash)]
        user = self.select_from_table('users', columns=['id'], where=where_clause)

        print(user)

        if (user['result'] and len(user['result']) == 1):
            user_id = user['result'][0]['id']
            response = {
                'auth_token': self.auth_token,
                'user_id': user_id
            }
            return Response(response=json.dumps(response), status=200, mimetype='application/json')
        else:
            abort(401)

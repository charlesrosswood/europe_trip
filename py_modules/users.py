__author__ = 'cwod'

from operator import itemgetter


class User(object):

    def __init__(self, username):
        self.username = username

    # TODO: work out how to get a user, validate them and stuff, probably handled by Flask anyway.
    def get_user_from_db(self, db):
        users_where_string = ["username='%s'" % (self.username)]
        users_results = db.select_from_table('users', where=users_where_string)

        if len(users_results['result']) > 1:
            return None
        else:
            users_details = users_results['result'][0]
            users_profiles_where_string = ["user_id='%s'" % (users_details['id'],)]
            user_profile_results = db.select_from_table('user_profiles',
                where=users_profiles_where_string)
            if user_profile_results['result']:
                profile_details = user_profile_results['result'][0]
                print(profile_details)
                self.first_name = profile_details['first_name']
                self.first_name = profile_details['last_name']
            else:
                self.first_name = ''
                self.last_name = ''
            self.user_id = users_details['id']
            self.email = users_details['email']

            return self

    @staticmethod
    def get_all_users_from_db(db):
        users_results = db.select_from_table('users')

        if len(users_results['result']) == 0:
            return None
        else:
            user_profile_results = db.select_from_table('user_profiles')
            profile_details = user_profile_results['result']

            user_list = []
            for user in users_results['result']:
                user_id = user['id']
                user_profile = next((profile for profile in profile_details if profile[
                    'user_id']==user_id), {})
                user_dict = {
                    'username': user['username'],
                    'user_id': user_id,
                    'first_name': user_profile.get('first_name', None),
                    'last_name': user_profile.get('last_name', None),
                    'email': user['email']
                }

                if user_dict['first_name'] and user_dict['last_name']:
                    user_dict['name'] = '%s %s (%s)' % (user_dict.get('first_name', ''),
                                               user_dict.get('last_name', ''), user_dict.get(
                        'username', ''))
                else:
                    user_dict['name'] = '%s' % (user_dict.get('username',''),)

                user_list.append(user_dict)
            return user_list

    def get_user_uploads(self, db):

        users_uploads = {}

        where_string = ["user_id='%s'" % (self.user_id)]
        db_result= db.select_from_table('posts', where=where_string)
        results = db_result['result']
        users_uploads['posts'] = sorted(results, key=itemgetter('post_timestamp'), reverse=True)

        return users_uploads

    @staticmethod
    def get_all_users_uploads(db):
        user_list = User.get_all_users_from_db(db)
        print(user_list)
        user_uploads_list = []
        if user_list:
            for user in user_list:
                provisional_user = User(user['username'])
                current_user = provisional_user.get_user_from_db(db)
                user_uploads = current_user.get_user_uploads(db)
                user.update(user_uploads)
                user_uploads_list.append(user)

        return user_uploads_list
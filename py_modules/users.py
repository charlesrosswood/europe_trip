__author__ = 'cwod'


class User(object):

    def __init__(self, username):
        self.username = username

    # TODO: work out how to get a user, validate them and stuff, probably handled by Flask anyway.
    def get_user_from_db(self, db):
        users_where_string = ["username='%s'" % (self.username)]
        users_results = db.select_from_table('users', where=users_where_string)

        if users_results['result'].length > 1:
            return None
        else:
            users_details = users_results['result'][0]
            users_profiles_where_string = ["users_id='%s'" % (users_details[
                                                                  'users_id'],)]
            user_profile_results = db.select_from_table('user_profiles',
                users_profiles_where_string)
            profile_details = user_profile_results['result'][0]

            self.user_id = users_details['users_id']
            self.email = users_details['email']
            self.first_name = profile_details['first_name']
            self.first_name = profile_details['last_name']

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
                user_id = user['users_id']
                user_profile = next((profile for profile in profile_details if profile[
                    'users_id']==user_id), {})
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

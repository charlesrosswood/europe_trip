#!/usr/bin/python3
# -*- coding: utf-8 -*-

__author__ = 'cwod'

import psycopg2 as dbdriver
import psycopg2.extras


class ReturnStatus(object):
    """

    """

    def __init__(self, return_value, status_code=None, error_message=None, message=None):

        self.status = status_code
        self.result = return_value
        self.error_message = error_message
        self.message = message

    def get_dict(self):
        return_dict = {
            'status': self.status,
            'result': self.result,
            'error_message': self.error_message,
            'message': self.message
        }
        return return_dict


class DatabaseConfig(object):
    """

    """

    def __init__(self, host, dbname, user, password, port):
        """
        Use this to instantiate the Database config class

        :param host:
        :param dbname:
        :param user:
        :param password:
        :return:
        """
        connection_string = "host='%s' dbname='%s' user='%s' password='%s' port=%s" % (host,
                                                                                       dbname,
                                                                                       user,
                                                                                       password,
                                                                                       port)

        self.config = connection_string  # is this unnecessary?
        self.connection = None
        self.connectDb()

    def connectDb(self):
        if self.connection:
            if self.connection.closed != 0:
                self.connection.close()
                self.connection = dbdriver.connect(self.config)
        else:
            self.connection = dbdriver.connect(self.config)


    def select_from_table(self, tablename, columns=None, schema=None, where=None):
        """

        :param tablename:
        :param columns:
        :param schema:
        :param where:
        :return:
        """
        if columns is None:
            columns = ['*']

        columns_to_select = ','.join(columns)

        if schema is None:
            select_statement = 'SELECT %s FROM %s' % (columns_to_select, tablename)
        else:
            select_statement = 'SELECT %s FROM %s.%s' % (columns_to_select, schema, tablename)

        if where:  # should be a list
            if not isinstance(where, list):
                where = [where]
            select_statement += ' WHERE %s' % (' AND '.join(where),)
        else:
            #  necessary to cover off empty list
            where = None
        cleaned_records = []
        with self.connection.cursor() as db_cursor:
            try:
                db_cursor.execute(select_statement)
                # fetch the column names to make a dictionary/hash map object
                column_names = [desc[0] for desc in db_cursor.description]

                records = db_cursor.fetchall()

                # this will be slow
                for record in records:
                    print('record:        ', record)
                    record_dict = {}
                    for i in range(len(column_names)):
                        try:
                            print('with decoding:        ', record[i].decode('utf-8'))
                            record_dict[column_names[i]] = record[i].decode('utf-8')
                        except (AttributeError, ValueError):
                            print('no decoding:        ', record[i])
                            record_dict[column_names[i]] = record[i]
                    cleaned_records.append(record_dict)

                db_cursor.close()

                response = ReturnStatus(return_value=cleaned_records, status_code=200,
                    message='statement: "%s"' % (select_statement,))
            except (psycopg2.InternalError,
                    psycopg2.ProgrammingError,
                    psycopg2.IntegrityError) as e:
                self.connection.rollback()
                response = ReturnStatus(return_value=None, status_code=500,
                    message='We failed to execute the statement: "%s"' % (select_statement,),
                    error_message=e.pgerror)

        return response.get_dict()

    def select_from_large_table(self, tablename, columns=None, schema=None, where=None):
        """

        :param tablename:
        :param columns:
        :param schema:
        :param where:
        :return:
        """
        if columns is None:
            columns = ['*']

        columns_to_select = ','.join(columns)

        if schema is None:
            select_statement = 'SELECT %s FROM %s' % (columns_to_select, tablename)
        else:
            select_statement = 'SELECT %s FROM %s.%s' % (columns_to_select, schema, tablename)

        if where is not None:  # should be a list
            select_statement += ' WHERE %s' % (' AND '.join(where),)

        with self.connection.cursor(
            'cursor_unique_name', cursor_factory=psycopg2.extras.DictCursor) as db_cursor:
            try:
                db_cursor.execute(select_statement)
            except (psycopg2.InternalError,
                    psycopg2.ProgrammingError,
                    psycopg2.IntegrityError) as e:
                self.connection.rollback()

            return db_cursor  # note this is now an iterable

    def insert_into_table(self, tablename, values, columns=None, schema=None):
        # TODO: suffers from SQL injections
        """
        NOTE: This should return the IDs of the newly created rows

        :param tablename:
        :param values:
        :param columns:
        :param schema:
        :return:
        """

        if schema is None:
            insert_string = 'INSERT INTO %s ' % (tablename,)
        else:
            insert_string = 'INSERT INTO %s.%s ' % (schema, tablename)

        if columns is not None:
            insert_string += '(%s) ' % (','.join(columns),)

        insert_string += 'VALUES '

        with self.connection.cursor() as cursor:
            values_string = b','.join(cursor.mogrify("%s", (x, )) for x in values).decode('utf-8')
            SQL_statement = insert_string + values_string.replace('ARRAY[', '(').replace(']',')')

            #  adding returning the table id
            SQL_statement += ' RETURNING id'
            try:
                cursor.execute(SQL_statement)
                # cursor.executemany(SQL_statement % (values))
                row_id = cursor.fetchone()[0]

                return_dict = [{
                    'id': row_id
                }]
                self.connection.commit()
                response = ReturnStatus(return_value=return_dict, status_code=201,
                    message='statement: ''"%s"' % (SQL_statement, ))
            except (psycopg2.InternalError,
                    psycopg2.ProgrammingError,
                    psycopg2.IntegrityError) as e:
                self.connection.rollback()
                response = ReturnStatus(return_value=None, status_code=500,
                    message='statement: "%s"' % (SQL_statement, ), error_message=e.pgerror)

        return response.get_dict()

    def update_table(self, tablename, set_clauses, where_clauses=None, schema=None):
        """
        set_clauses should be a list of "<db_param>=<new_value>"
        :param tablename:
        :param set_clauses:
        :param where_clause:
        :param schema:
        :return:
        """
        if schema is None:
            update_string = 'UPDATE %s ' % (tablename,)
        else:
            update_string = 'UPDATE %s.%s ' % (schema, tablename)

        update_string += 'SET %s' % (','.join(set_clauses))

        if where_clauses:
            update_string += ' WHERE %s' % (','.join(where_clauses))

        update_string += ' RETURNING id'

        with self.connection.cursor() as cursor:
            try:
                cursor.execute(update_string)
                row_ids = cursor.fetchall()
                return_dict = [{
                    'ids': [id[0] for id in row_ids]
                }]

                self.connection.commit()
                response = ReturnStatus(return_value=return_dict, status_code=200,
                    message='statement: ''"%s"' % (update_string, ))
            except (psycopg2.InternalError,
                    psycopg2.ProgrammingError,
                    psycopg2.IntegrityError) as e:
                self.connection.rollback()
                response = ReturnStatus(return_value=None, status_code=500,
                    message='statement: "%s"' % (update_string, ), error_message=e.pgerror)

        return response.get_dict()

    def delete_from_table(self, tablename, where_clauses=None, schema=None):
        """
        Allows removal of a database row
        :param tablename:
        :param where_clauses:
        :param schema:
        :return:
        """
        if schema is None:
           delete_string = 'DELETE FROM %s ' % (tablename,)
        else:
            delete_string = 'DELETE FROM %s.%s ' % (schema, tablename)

        if where_clauses:
            delete_string += ' WHERE %s' % (','.join(where_clauses))

        delete_string += ' RETURNING id'

        with self.connection.cursor() as cursor:
            try:
                cursor.execute(delete_string)
                row_ids = cursor.fetchall()
                return_dict = [{
                    'ids': [id[0] for id in row_ids]
                }]

                self.connection.commit()
                response = ReturnStatus(return_value=return_dict, status_code=200,
                    message='statement: ''"%s"' % (delete_string, ))
            except (psycopg2.InternalError,
                    psycopg2.ProgrammingError,
                    psycopg2.IntegrityError) as e:
                self.connection.rollback()
                response = ReturnStatus(return_value=None, status_code=500,
                    message='statement: "%s"' % (delete_string, ), error_message=e.pgerror)

        return response.get_dict()

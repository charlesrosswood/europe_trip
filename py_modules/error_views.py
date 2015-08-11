#!/usr/bin/python3
# -*- coding: utf-8 -*-

__author__ = 'cwod'

from flask import render_template


class ErrorRenderers(object):
    """
    A static class for dealing with errors.

    """

    @staticmethod
    def forbidden(e):
        return render_template('errors/400.html'), 400

    @staticmethod
    def unauthorised(e):
        return render_template('errors/401.html'), 401

    @staticmethod
    def bad_request(e):
        return render_template('errors/403.html'), 403

    @staticmethod
    def page_not_found(e):
        return render_template('errors/404.html'), 404

    @staticmethod
    def method_not_allowed(e):
        print('error', e)
        return render_template('errors/405.html'), 405

    @staticmethod
    def gone(e):
        return render_template('errors/410.html'), 410

    @staticmethod
    def server_error(e):
        return render_template('errors/500.html'), 500

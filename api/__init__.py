import os
import logging
import logging.handlers

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

basedir = os.path.abspath(os.path.dirname(__file__))  # /api folder
rootdir = os.path.dirname(basedir)  # / folder

max_bytes = 10 * 1000 * 1000  # 10MB
log_formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")


def get_logger(name):
    l = logging.getLogger(name)
    l.setLevel(logging.DEBUG)

    file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(rootdir, 'log', 'debug.log')
        , maxBytes=max_bytes, backupCount=100)
    file_handler.setFormatter(log_formatter)
    l.addHandler(file_handler)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_formatter)
    l.addHandler(console_handler)

    return l


logger = get_logger("Init")


class DevConfig(object):
    UPLOAD_TO_S3 = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(rootdir, 'jogging.db')
    SECRET_KEY = 'fitle secret'


app = Flask(__name__, static_folder=os.path.join(rootdir, "static"))
app.config.from_object(DevConfig())
db = SQLAlchemy(app)
import models

# create all tables
db.create_all()

import auth_service
import entry_service

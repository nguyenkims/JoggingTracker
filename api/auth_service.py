from flask import request, jsonify, g
from flask.ext.httpauth import HTTPBasicAuth

from api import app, get_logger
from api.models import User


# 1 year of token duration = 60 seconds * 60 minutes * 24 hour * 365 days
TOKEN_DURATION = 60 * 60 * 24 * 365

logger = get_logger(__name__)

auth = HTTPBasicAuth()


@auth.verify_password
def verify_token(token, useless):
    """
    Verify if the token is valid then get the user associated with this token.
    The fetched user is then put in global context.
    """
    user = User.verify_auth_token(token)
    if not user:
        return False

    g.user = user
    return True


@app.route('/user/create', methods=['POST'])
def classic_registration():
    data = get_data(request)
    username = data.get('username')
    password = data.get('password')
    token_duration = data.get('duration')

    if not username or not password:
        return get_error("username, password must be provided"), 400

    if User.query.filter_by(username=username).first() is not None:
        logger.info("username:%s is already used", username)
        return get_error("existing user"), 409  # existing user

    logger.info("create classic user, username:%s", username)
    # create and save new user to db
    user = User(username=username)
    user.create(password)

    if token_duration:
        token_duration = int(token_duration)
        return jsonify(user_info(user, token_duration)), 201
    else:
        return jsonify(user_info(user)), 201


@app.route('/user/token', methods=['GET', 'POST'])
def get_token():
    data = get_data(request)
    username = data.get('username')
    password = data.get('password')
    token_duration = data.get('duration')

    if not username or not password:
        return get_error("username, password must be provided"), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.verify_password(password):
        logger.info("username:%s , password:%s are not correct" % (username, password))
        return get_error("user or password incorrect"), 400

    if token_duration:
        token_duration = int(token_duration)
        return jsonify(user_info(user, token_duration)), 200
    else:
        return jsonify(user_info(user)), 200


@app.route('/user/tokenvalidity', methods=['GET', 'POST'])
def get_token_validity_status():
    """check if the token is still valid. If not return 400. If valid, return new token"""
    token = request.authorization.username
    user = User.verify_auth_token(token)
    if not user:
        return get_error("token not valid"), 400
    else:
        return jsonify(user_info(user)), 200


def user_info(user, token_duration=TOKEN_DURATION):
    token = user.generate_auth_token(token_duration).decode('ascii')
    return {'username': user.username, 'token': token,
            'duration': token_duration}


def get_error(msg):
    return jsonify({"error": msg})


def get_data(req):
    """get form data or json data from request"""
    if len(req.form) == 0:
        return req.json
    return req.form

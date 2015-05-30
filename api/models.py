from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

from api import db, app, hashing


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), index=True, unique=True)
    password_hash = db.Column(db.String(64))

    entries = db.relationship('Entry', backref='user', lazy='dynamic')

    def __repr__(self):
        return "id:%s username:%s" % (self.id, self.username)

    def create(self, password=None):
        if password:
            self.password_hash = hashing.encrypt(password)
        # save the new user to DB
        db.session.add(self)
        db.session.commit()

    def verify_password(self, password):
        return hashing.verify(password, self.password_hash)

    def generate_auth_token(self, expiration):
        s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
        return s.dumps({'id': self.id})

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None  # valid token, but expired
        except (BadSignature, TypeError):
            return None  # invalid token

        user = User.query.get(data['id'])
        return user


class Entry(db.Model):
    __tablename__ = 'entry'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    date = db.Column(db.Date)
    distance = db.Column(db.Float)
    time = db.Column(db.Float)

    def __repr__(self):
        return "id:%s date:%s distance:%s time:%s" % (self.id, self.date, self.distance, self.time)

    def create(self):
        # save the new user to DB
        db.session.add(self)
        db.session.commit()

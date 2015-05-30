"""
hash
~~~~~~

A very simple implementation of password hashing algorithm
"""


def encrypt(password):
    return password + ":" + "secret"


def verify(password, password_hash):
    if ":secret" in password_hash:
        index = password_hash.rindex(":secret")
        return password == password_hash[:index]
    return False



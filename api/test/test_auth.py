import unittest

import requests

prefix = "http://127.0.0.1:5000"


class AuthTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # create the test account
        r = requests.post(prefix + "/user/create", data={
            "username": "test user",
            "password": "test password"
        })
        # create new account successfully or account exists already
        assert r.status_code == 201 or r.status_code == 409
        if r.status_code == 409:
            print 'user exists already'

    def test_cannot_use_existing_username(self):
        # test cannot create an account with existing username
        r = requests.post(prefix + "/user/create", data={
            "username": "test user",
            "password": "password 2"
        })
        # create new account successfully or account exists already
        assert r.status_code == 409

    def test_token_missing_username(self):
        """test cannot get the token if password is not provided"""
        r = requests.post(prefix + "/user/token",
                          data={
                              "username": "test user",
                          })

        assert r.status_code == 400

    def test_token_missing_password(self):
        """test cannot get the token if username is not provided"""

        r = requests.post(prefix + "/user/token",
                          data={
                              "password": "test pass",
                          })

        assert r.status_code == 400

    def test_token(self):
        """test we can get the token for the user created precedently"""
        r = requests.post(prefix + "/user/token",
                          data={
                              "username": "test user",
                              "password": "test password"
                          })

        assert r.status_code == 200
        assert r.json()["username"] == "test user"


if __name__ == '__main__':
    unittest.main()

import unittest

import requests

prefix = "http://127.0.0.1:5000"


class EntryTest(unittest.TestCase):
    token = None

    @classmethod
    def setUpClass(cls):
        # create the test account
        r = requests.post(prefix + "/user/create", data={
            "username": "test user",
            "password": "test password"
        })
        # create new account successfully or account exists already
        assert r.status_code == 201 or r.status_code == 409

        if r.status_code == 201:
            print "new user"
            token = r.json()["token"]

        elif r.status_code == 409:
            print 'user exists already'
            # get the token
            r = requests.post(prefix + "/user/token", data={
                "username": "test user",
                "password": "test password"
            })
            token = r.json()["token"]

        assert token is not None
        EntryTest.token = token

    def test_create_entry_successfully(self):
        r = requests.post(prefix + "/entry/create",
                          auth=(EntryTest.token, 'useless password'),
                          data={
                              "date": 1400000000000,
                              "distance": "2.8",
                              "time": "10.3"
                          })

        assert r.status_code == 201      
        assert r.json()["date"] == 1400000000000
        assert r.json()["distance"] == "2.8"
        assert r.json()["time"] == "10.3"
        assert r.json()["id"] is not None

    def test_create_entry_missing_field(self):
        """test entry will not be created if it has missing fields"""
        # missing "date" field
        r = requests.post(prefix + "/entry/create",
                          auth=(EntryTest.token, 'useless password'),
                          data={
                              "distance": "2.8",
                              "time": "10.3"
                          })

        assert r.status_code == 400

    def test_create_entry_bad_date(self):
        """test entry will not be created if date is too big"""
        # "month" and "day" is switched
        r = requests.post(prefix + "/entry/create",
                          auth=(EntryTest.token, 'useless password'),
                          data={
                              "date": "1000000000000000000",
                              "distance": "2.8",
                              "time": "10.3"
                          })

        assert r.status_code == 400

    def test_create_entry_bad_float_format(self):
        """test entry will not be created if distance or time format is not correct"""
        # "month" and "day" is switched
        r = requests.post(prefix + "/entry/create",
                          auth=(EntryTest.token, 'useless password'),
                          data={
                              "date": 1312908481000,
                              "distance": "2,8",
                              "time": "10.3"
                          })

        assert r.status_code == 400

    def test_create_get_all(self):
        """test entry will not be created if distance or time format is not correct"""
        # "month" and "day" is switched
        r = requests.post(prefix + "/entry/all",
                          auth=(EntryTest.token, 'useless password'))

        assert r.status_code == 200
        assert r.json().get("data") is not None

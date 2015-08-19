#!/usr/bin/env bash

echo "========================================================="
echo "Launch the server"
PROD= gunicorn --reload --bind 0.0.0.0:5001 --workers 1 wsgi

#!/bin/sh

pythom -m venv ./venv --system-site-packages
source ./venv/bin/activate
pip install flask flask-cors
echo "venv created and activated."
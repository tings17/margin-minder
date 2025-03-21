#!/usr/bin/env bash

apt-get update -y
apt-get install -y tesseract-ocr
which tesseract

# Continue with the rest of your setup
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
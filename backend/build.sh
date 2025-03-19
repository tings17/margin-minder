#!/usr/bin/env bash

apt-get update
apt-get install -y tesseract-ocr

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate
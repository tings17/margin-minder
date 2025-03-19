#!/usr/bin/env bash

echo "Starting setup..."
apt-get update -y
echo "Installing Tesseract OCR..."
apt-get install -y tesseract-ocr
echo "Tesseract installed. Checking location:"
which tesseract

# Continue with the rest of your setup
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
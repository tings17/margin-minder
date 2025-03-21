FROM python:3.9-slim

RUN apt-get update -y && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY . .

WORKDIR /app/backend

RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
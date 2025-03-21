FROM python:3.11-slim

RUN apt-get update -y && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY . .

WORKDIR /app/backend

CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000"]
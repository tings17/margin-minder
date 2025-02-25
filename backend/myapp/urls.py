from django.urls import path
from . import views

urlpatterns = [
    path("", views.upload_and_ocr, name='upload_and_ocr'),
    path('result/<int:pk>', views.result_view, name='result'),
]
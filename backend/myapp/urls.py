from django.urls import path
from . import views

urlpatterns = [
    path("", views.upload_and_ocr, name='upload_and_ocr'),
    path('result/<int:pk>', views.result_view, name='result'),
    #the pk=uploaded_image.pk in views.py parameter becomes part of the URL which DJango then uses to call the result_view function with that pk
]
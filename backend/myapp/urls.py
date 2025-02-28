from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("", views.upload_and_ocr, name='upload_and_ocr'),
    path('result/<int:pk>', views.result_view, name='result'),
    #the pk=uploaded_image.pk in views.py parameter becomes part of the URL which DJango then uses to call the result_view function with that pk
    #path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #accesstoken
    #path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), #refreshtoken
    path("accounts/", include('django.contrib.auth.urls')), #built in
    path('accounts/register/', views.register, name='register'), #built in
]
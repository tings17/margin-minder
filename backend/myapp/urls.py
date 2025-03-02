from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    #path("", views.upload_and_ocr, name='upload_and_ocr'),
    #path('result/<int:pk>', views.result_view, name='result'),
    #path("accounts/", include('django.contrib.auth.urls')), #built in
    #path('accounts/register/', views.register, name='register'), #built in
    #the pk=uploaded_image.pk in views.py parameter becomes part of the URL which DJango then uses to call the result_view function with that pk
    
    # jwt authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #accesstoken
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), #refreshtoken

    path('api/users/', views.CreateUserView.as_view(), name='create-user'),
    
    path('api/books/', views.BookListCreateView.as_view(), name='book-list-create'),
    path('api/books/<int:pk>/', views.BookDetailView.as_view(), name='book-detail'),

    path('api/annotations/', views.AnnotationListCreateView.as_view(), name='annotation-list-create'),
    path('api/annotations/<int:pk>/', views.AnnotationDetailView.as_view(), name='annotation-detail'),
]
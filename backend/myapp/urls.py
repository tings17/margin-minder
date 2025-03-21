from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('api/token/', views.CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/authcheck/', views.AuthCheckView.as_view(), name='authcheck'),
    
    # User management
    path('api/users/', views.CreateUserView.as_view(), name='create-user'),
    
    # Book and Annotation endpoints 
    path('api/books/', views.BookListCreateView.as_view(), name='book-list-create'),
    path('api/books/<int:pk>/', views.BookDetailView.as_view(), name='book-detail'),
    path('api/annotations/', views.AnnotationListCreateView.as_view(), name='annotation-list-create'),
    path('api/annotations/<int:pk>/', views.AnnotationDetailView.as_view(), name='annotation-detail'),
    
    # path('api/users/', views.CreateUserView.as_view(), name='create-user'),
    # path('api/login/', views.LoginView.as_view(), name='login'),
    # path('api/logout/', views.LogoutView.as_view(), name='logout'),
    # path('api/refresh/', views.CookieTokenRefreshView.as_view(), name='token-refresh'),
    # path('api/authcheck/', views.AuthCheckView.as_view(), name='authcheck'),
    
    # path('api/books/', views.BookListCreateView.as_view(), name='book-list-create'),
    # path('api/books/<int:pk>/', views.BookDetailView.as_view(), name='book-detail'),

    # path('api/annotations/', views.AnnotationListCreateView.as_view(), name='annotation-list-create'),
    # path('api/annotations/<int:pk>/', views.AnnotationDetailView.as_view(), name='annotation-detail'),
]
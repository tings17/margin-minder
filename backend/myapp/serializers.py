from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Annotation, Book

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}} 

    def create(self, validate_data):
        user = User.objects.create_user(**validate_data)
        return user
    
class LoginUserSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials.")
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        
        return token

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "book_name", "author_name", "user", "number_of_annotations"]
        read_only_fields = ["user", "number_of_annotations"]

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ["id", "annotation_type", "image", "book", "page_number", "image_text", "annotation_text"]
        extra_kwargs = {
            'image': {'required': False}
        }

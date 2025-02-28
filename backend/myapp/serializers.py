from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Annotation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}} #tells Django that we want to accept the password but not return password when user info asked

    def create(self, validate_data):
        user = User.objects.create_user(**validate_data)
        return user #when we want to create a new version of the user (validated data: all fields and password valid) **spliting up the data
    
class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ["id", "image", "image_text", "book_name", "author_name", "created_at", "annotation_user"]
        read_only_fields = ["id", "image_text", "created_at", "annotation_user"]

"""
class BookSerializer"""
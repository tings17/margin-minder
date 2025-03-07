from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Annotation, Book

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}} #tells Django that we want to accept the password but not return password when user info asked

    def create(self, validate_data):
        user = User.objects.create_user(**validate_data)
        return user #when we want to create a new version of the user (validated data: all fields and password valid) **spliting up the data

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "book_name", "author_name", "user", "number_of_annotations"]
        read_only_fields = ["user", "number_of_annotations"]

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ["id", "annotation_type", "image", "book", "page_number", "image_text"]
        extra_kwargs = {
            'image': {'required': False}
        }
        #read_only_fields = ["image_text"]

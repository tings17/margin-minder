from django.contrib import admin

# Register your models here.

from .models import Annotation, Book

admin.site.register(Book)
admin.site.register(Annotation)
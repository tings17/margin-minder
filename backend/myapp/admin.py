from django.contrib import admin

# Register your models here.

from .models import Annotation

admin.site.register(Annotation)
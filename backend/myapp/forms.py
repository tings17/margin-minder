from django import forms
from .models import Annotation

class AnnotationForm(forms.ModelForm):
    #a form class that inherits from Django's ModelForm (automatically generate from fields based on the fields in the model)
    class Meta:
        #nested Meta class that provides metadata about the form
        model = Annotation
        fields = ["book_name", "image"]
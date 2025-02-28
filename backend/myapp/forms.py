from django import forms
from .models import Annotation
from .models import Book

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ["book_name", "author_name"]

class AnnotationForm(forms.ModelForm):
    #a form class that inherits from Django's ModelForm (automatically generate from fields based on the fields in the model)
    class Meta:
        #nested Meta class that provides metadata about the form
        model = Annotation
        fields = ["page_number", "image"]

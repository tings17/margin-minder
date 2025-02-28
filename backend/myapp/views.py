from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
#from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.db import transaction
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from pytesseract import pytesseract
from PIL import Image
from .models import Annotation, Book
from .forms import AnnotationForm, BookForm

pytesseract.tesseract_cmd = "/opt/homebrew/Cellar/tesseract/5.5.0/bin/tesseract"

# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] #anyone can use this view

def home(request):
    return render(request, "home.html")

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            #username = form.cleaned_data.get('username')
            #password = form.cleaned_data.get('password')
            #user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('upload_and_ocr')  # Redirect to your main page
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})

#@api_view(["GET", "POST"])
#@permission_classes([IsAuthenticated])
@login_required
def upload_and_ocr(request):
    if request.method == "POST":
        book_form = BookForm(request.POST)
        form = AnnotationForm(request.POST, request.FILES)
        
        book_choice = request.POST.get("book_choice")

        if form.is_valid():
            uploaded_image = form.save(commit=False) #AnnotationForm's model field which is the Annotation model instance
            # Annotation model fields: image (uploaded image) and image_text: text field (blank initially)
            #uploaded_image.annotation_user = request.user
            
            with transaction.atomic():
                if book_choice == "existing" and request.POST.get("existing_book"):
                    book_id = request.POST.get("existing_book")
                    book = get_object_or_404(Book, id=book_id, user=request.user)
                    book.number_of_annotations += 1
                    book.save()
                elif book_choice == "new" and book_form.is_valid():
                    book = book_form.save(commit=False)
                    book.user = request.user
                    book.number_of_annotations = 1
                    book.save()

            uploaded_image.book = book

            image = Image.open(uploaded_image.image)
            uploaded_image.image_text = pytesseract.image_to_string(image)
            uploaded_image.save() # save the annotation object to the database (with ocr text)
            book.save()
            return redirect('result', pk=uploaded_image.pk) #redirect "result" URL passing the primary key (pk) of the saved Annotation object
    else: #if not POST (a GET request instead)
        # empty ANnotationFOrm instance for the user to fill out
        book_form = BookForm()
        form = AnnotationForm()
        user_books = Book.objects.filter(user=request.user)

    # render the upload.html template with the form (either empty or with validation errors) passed as context
    return render(request,'upload.html', {'form': form, "book_form": book_form, "user_books": user_books})

#@api_view(["GET", "POST"])
#@permission_classes([IsAuthenticated])
@login_required
def result_view(request, pk):
    # passing in the pk value that was passed in the URL
    # uses Django's ORM (object-relational mapper) to query the DB
    # request parameter & primary key for the Annotation's primary key
    image_entry = Annotation.objects.get(pk=pk)
    # retrieves the Annotation object with the given primarykey from the database
    if image_entry.book.user != request.user:
        return HttpResponseForbidden("You don't have permission to view this annotation")
    return render(request, 'result.html', {'image_entry': image_entry}) #renders the result.html template (passing the retrieved Annotation object as context)
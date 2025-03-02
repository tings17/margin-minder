from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.forms import UserCreationForm
#from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from .forms import AnnotationForm, BookForm

from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserSerializer, BookSerializer, AnnotationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from pytesseract import pytesseract
import cv2
import numpy as np
from PIL import Image
from .models import Annotation, Book

pytesseract.tesseract_cmd = "/opt/homebrew/Cellar/tesseract/5.5.0/bin/tesseract"

# Create your views here.

def extract_highlight(image, lower, upper):
    img = cv2.imread(image)
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV) # rgb to hsv (hue, saturation, )
    hsv_lower = np.array(lower, np.uint8)
    hsv_upper = np.array(upper, np.uint8)

    img_mask = cv2.inRange(img_hsv, hsv_lower, hsv_upper)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    mask_denoised = cv2.morphologyEx(img_mask, cv2.MORPH_OPEN, kernel, iterations=1)
    contours, _ = cv2.findContours(mask_denoised, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    rect_mask = np.zeros_like(mask_denoised)
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 20 and h > 5:
            padding = 5
            x_pad = max(0, x - padding)
            y_pad = max(0, y - padding)
            w_pad = min(rect_mask.shape[1] - x_pad, w + 2*padding)
            h_pad = min(rect_mask.shape[0] - y_pad, h + 2*padding)

            cv2.rectangle(rect_mask, (x_pad, y_pad), (x_pad + w_pad, y_pad + h_pad), 255, -1)
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    highlighted = cv2.bitwise_and(gray, gray, mask=rect_mask)

    pil_img = Image.fromarray(highlighted)

    highlighted_text = pytesseract.image_to_string(pil_img)

    return highlighted_text

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] #anyone can use this view

class BookListCreateView(generics.ListCreateAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(self.request.user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)

class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(self.request.user)

class AnnotationListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        book_id = self.request.query_params.get("book")
        if book_id:
            return Annotation.objects.filter(book__user=self.request.user, book_id=book_id)
        return Annotation.objects.filter(book__user=self.request.user)
    
    def perform_create(self, serializer):
        annotation = serializer.save()

        img_path = annotation.image.path
        annotation.image_text = self.extract_highlight(img_path, np.array([15, 50, 50]), np.array([40, 255, 255]))
        annotation.save()

        book = annotation.book
        book.number_of_annotations = book.annotations.count()
        book.save()

class AnnotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Annotation.objects.filter(book__user=self.request.user)
    
    def perform_update(self, serializer):
        annotation = serializer.save()

        if "image" in self.request.data:
            img_path = annotation.image.path
            annotation.image_text = self.extract_highlight(img_path, np.array([15, 50, 50]), np.array([40, 255, 255]))
            annotation.save()

    def perform_destroy(self, instance):
        book = instance.book
        instance.delete()
        book.number_of_annotations = book.annotations.count()
        book.save()

class TextAnnotationCreateView(generics.CreateAPIView):
    serializer_class = AnnotationSerializer 
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        annotation = serializer.save()

        book = annotation.book
        book.number_of_annotations = book.annotations.count()
        book.save()
"""

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
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
        print("got form")

        if form.is_valid():
            uploaded_image = form.save(commit=False)
            print("form valid")
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
            uploaded_image.save()
            img_path = uploaded_image.image.path
            uploaded_image.image_text = extract_highlight(img_path, np.array([15, 50, 50]), np.array([40, 255, 255]))
            uploaded_image.save() # save the annotation object to the database (with ocr text)
            book.save()
            return redirect('result', pk=uploaded_image.pk) #redirect "result" URL passing the primary key (pk) of the saved Annotation object
    else: 
        book_form = BookForm()
        form = AnnotationForm()
        user_books = Book.objects.filter(user=request.user)

    return render(request,'upload.html', {'form': form, "book_form": book_form, "user_books": user_books})

#@api_view(["GET", "POST"])
#@permission_classes([IsAuthenticated])
@login_required
def result_view(request, pk):
    image_entry = Annotation.objects.get(pk=pk)
    if image_entry.book.user != request.user:
        return HttpResponseForbidden("You don't have permission to view this annotation")
    return render(request, 'result.html', {'image_entry': image_entry}) #renders the result.html template (passing the retrieved Annotation object as context)
"""


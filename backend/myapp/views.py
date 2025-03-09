from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import UserSerializer, BookSerializer, AnnotationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from pytesseract import pytesseract
import cv2
import numpy as np
from PIL import Image
from .models import Annotation, Book

pytesseract.tesseract_cmd = "/opt/homebrew/Cellar/tesseract/5.5.0/bin/tesseract"

def extract_highlight(image, lower, upper):
    img = cv2.imread(image)
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
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
            h_padding = 5
            top_padding = 15
            bottom_padding = 15
            x_pad = max(0, x - h_padding)
            y_pad = max(0, y - top_padding)
            w_pad = min(rect_mask.shape[1] - x_pad, w + 2*h_padding)
            h_pad = min(rect_mask.shape[0] - y_pad, h + top_padding + bottom_padding)

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
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return Book.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(user=self.request.user)

class AnnotationListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        book_id = self.request.query_params.get("book")
        if book_id:
            return Annotation.objects.filter(book__user=self.request.user, book_id=book_id)
        return Annotation.objects.filter(book__user=self.request.user)
    
    def perform_create(self, serializer):
        annotation_type = self.request.data.get("annotation_type", "scan")

        annotation = serializer.save()
        
        if annotation_type == "manual":
            book = annotation.book
            book.number_of_annotations = book.annotations.count()
            book.save()

        else:
            try:
                img_path = annotation.image.path
                annotation.image_text = extract_highlight(img_path, np.array([22, 93, 0]), np.array([40, 255, 255]))
                annotation.save()
            except Exception:
                print("error processsing image")

        book = annotation.book
        book.number_of_annotations = book.annotations.count()
        book.save()

class AnnotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Annotation.objects.filter(book__user=self.request.user)
        book_id = self.request.query_params.get("book")
        if book_id:
            queryset = queryset.filter(book_id=book_id)
        return queryset
    
    def perform_update(self, serializer):
        annotation = serializer.save()

        if "image" in self.request.data:
            img_path = annotation.image.path
            annotation.image_text = self.extract_highlight(img_path, np.array([22, 93, 0]), np.array([40, 255, 255]))
            annotation.save()

    def perform_destroy(self, instance):
        book = instance.book
        instance.delete()
        book.number_of_annotations -= 1
        book.save()
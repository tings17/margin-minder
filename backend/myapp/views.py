from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import UserSerializer, BookSerializer, AnnotationSerializer, LoginUserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.response import Response
from rest_framework.views import APIView
from pytesseract import pytesseract
import cv2
import numpy as np
from PIL import Image
from .models import Annotation, Book

pytesseract.tesseract_cmd = settings.TESSERACT_PATH

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer

class LoginView(APIView):
    def post(self, request):
        serializer = LoginUserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({
                "user": UserSerializer(user).data},
                status=status.HTTP_200_OK)
            
            
            response.set_cookie(key='access_token',
                                value = access_token,
                                httponly=True,
                                secure=True,
                                samesite='None')
            
            response.set_cookie(key='refresh_token',
                                value = str(refresh),
                                httponly=True,
                                secure=True,
                                samesite='None')
            
            return response
        return Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except Exception as e:
                return Response({'error':'Error invalidating token:' + str(e) }, status=status.HTTP_400_BAD_REQUEST)
        
        response = Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')

        return response
    
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({'error': 'Refresh token not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            refresh = RefreshToken(refresh_token)
            user_id = refresh.payload.get('user_id')
            user = User.objects.get(id=user_id)
            
            refresh.blacklist()
            
            new_refresh = RefreshToken.for_user(user)
            new_refresh_token = str(new_refresh)
            access_token = str(new_refresh.access_token)

            response = Response({'message': 'Access token refreshed successfully.'}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                max_age=1800) # 30 mins
            
            response.set_cookie(
                key='refresh_token',
                value=new_refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                max_age=86400  # 24 hours
            )
            return response
        except (InvalidToken, User.DoesNotExist) as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

class AuthCheckView(APIView):
    def get(self, request):
        if request.user and request.user.is_authenticated:
            return Response({'authenticated': True}, status=status.HTTP_200_OK)
        return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)

class BookListCreateView(generics.ListCreateAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        book_id = self.request.query_params.get("id")
        if book_id:
            return Book.objects.filter(user=self.request.user, id=book_id)
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
                highlighter_color = self.request.data.get("highlighter_color")
                if highlighter_color == "yellow":
                    annotation.image_text = extract_highlight(img_path, np.array([22, 93, 0]), np.array([40, 255, 255]))
                elif highlighter_color == "pink":
                    annotation.image_text = extract_highlight(img_path, np.array([160, 50, 100]), np.array([180, 255, 255]))
                elif highlighter_color == "blue":
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

def extract_highlight(image, lower, upper):
    img = cv2.imread(image)
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hsv_lower = np.array(lower, np.uint8)
    hsv_upper = np.array(upper, np.uint8)
    img_mask = cv2.inRange(img_hsv, hsv_lower, hsv_upper)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    mask_denoised = cv2.morphologyEx(img_mask, cv2.MORPH_OPEN, kernel, iterations=1)
    contours, _ = cv2.findContours(mask_denoised, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    contour_mask = np.zeros_like(mask_denoised)
    cv2.drawContours(contour_mask, contours, -1, 255, -1)
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (30, 1))
    wider_mask = cv2.dilate(contour_mask, horizontal_kernel, iterations=1)

    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 50))
    dilated_mask = cv2.dilate(wider_mask, vertical_kernel, iterations=1)

    # Apply closing operation to smooth the mask
    smooth_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    final_mask = cv2.morphologyEx(dilated_mask, cv2.MORPH_CLOSE, smooth_kernel, iterations=2)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    highlighted = cv2.bitwise_and(gray, gray, mask=final_mask)
    pil_img = Image.fromarray(highlighted)

    highlighted_text = pytesseract.image_to_string(pil_img)

    return highlighted_text
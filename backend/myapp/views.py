from django.shortcuts import render, HttpResponse, redirect
from pytesseract import pytesseract
from PIL import Image
from .models import Annotation
from .forms import AnnotationForm
pytesseract.tesseract_cmd = "/opt/homebrew/Cellar/tesseract/5.5.0/bin/tesseract"

# Create your views here.
def home(request):
    return HttpResponse("hello world !")

def upload_and_ocr(request):
    annotations = dict()
    image_text = ""
    if request.method == "POST":
        form = AnnotationForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_image = form.save(commit=False)
            image = Image.open(uploaded_image.image)
            uploaded_image.image_text = pytesseract.image_to_string(image)
            uploaded_image.save()
            #image = Image.open(request.FILES['image'])
            #image_text = pytesseract.image_to_string(image)
            #form.save()
            return redirect('result', pk=uploaded_image.pk)
    else:
        form = AnnotationForm()
        #annotations.update({'image_text': image_text, })
    return render(request,'upload.html', {'form': form})

def result_view(request, pk):
    image_entry = Annotation.objects.get(pk=pk)
    return render(request, 'result.html', {'image_entry': image_entry})
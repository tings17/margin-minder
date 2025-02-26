from django.shortcuts import render, redirect
from pytesseract import pytesseract
from PIL import Image
from .models import Annotation
from .forms import AnnotationForm
pytesseract.tesseract_cmd = "/opt/homebrew/Cellar/tesseract/5.5.0/bin/tesseract"

# Create your views here.

def home(request):
    return render(request, "home.html")

def upload_and_ocr(request):
    annotations = dict()
    image_text = ""
    if request.method == "POST":
        form = AnnotationForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_image = form.save(commit=False) #AnnotationForm's model field which is the Annotation model instance
            # Annotation model fields: image (uploaded image) and image_text: text field (blank initially)
            image = Image.open(uploaded_image.image)
            uploaded_image.image_text = pytesseract.image_to_string(image)
            uploaded_image.save() # save the annotation object to the database (with ocr text)
            return redirect('result', pk=uploaded_image.pk) #redirect "result" URL passing the primary key (pk) of the saved Annotation object
    else: #if not POST (a GET request instead)
        # empty ANnotationFOrm instance for the user to fill out
        form = AnnotationForm()
        #annotations.update({'image_text': image_text, })

    # render the upload.html template with the form (either empty or with validation errors) passed as context
    return render(request,'upload.html', {'form': form})

def result_view(request, pk):
    # passing in the pk value that was passed in the URL
    # uses Django's ORM (object-relational mapper) to query the DB
    # request parameter & primary key for the Annotation's primary key
    image_entry = Annotation.objects.get(pk=pk)
    # retrieves the Annotation object with the given primarykey from the database
    return render(request, 'result.html', {'image_entry': image_entry}) #renders the result.html template (passing the retrieved Annotation object as context)
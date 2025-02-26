from django.db import models

# Create your models here.

class Annotation(models.Model):
    image = models.ImageField(upload_to="uploaded_images/")
    # stored in a directory within my media root directory
    image_text = models.TextField(blank=True)
    book_name = models.TextField(blank=True)

    # string representation method for the Annotation objects
    def __str__(self):
        # primary key
        return f"Image {self.id}"
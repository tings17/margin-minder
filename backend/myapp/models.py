from django.db import models

# Create your models here.

class Annotation(models.Model):
    image = models.ImageField(upload_to="uploaded_images/")
    image_text = models.TextField(blank=True)

    def __str__(self):
        return f"Image {self.id}"
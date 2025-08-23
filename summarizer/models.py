from django.db import models

# Create your models here.


class summarydb (models.Model):
    file_name = models.CharField (max_length=200)
    original_text = models.TextField()
    summary_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.file_name} - {self.created_at.strftime('%Y-%m-%d')}"
    


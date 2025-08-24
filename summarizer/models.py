from django.db import models

# Create your models here.
    



from django.contrib.auth.models import User

class Summary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="summaries")
    file_name = models.CharField(max_length=255)
    original_text = models.TextField()
    summary_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} ({self.user.username}) - {self.created_at:%Y-%m-%d %H:%M}"

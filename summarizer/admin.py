from django.contrib import admin
from .models import summarydb

# Register your models here.

@admin.register(summarydb)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ("file_name", "created_at")

from django.contrib import admin
from .models import Summary

@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ("file_name", "user", "created_at")
    search_fields = ("file_name", "user__username")

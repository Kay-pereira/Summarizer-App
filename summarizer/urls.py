
from django.urls import path, include
from summarizer.views import SummarizeView



urlpatterns = [
    path('api/', include('core.urls')),
]

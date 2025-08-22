
from django.urls import path, include
from summarizer.views import SummarizeView
from core.urls import 


urlpatterns = [
    path('api/', include('core.urls')),
]

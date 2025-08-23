
from django.urls import path, include
from summarizer.views import SummarizeView, SummaryListView



urlpatterns = [
    path('api/', include('core.urls')),
]

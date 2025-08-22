
from django.urls import path
from summarizer.views import SummarizeView

urlpatterns = [
    path('api/summarize/', SummarizeView.as_view(), name='summarize'),
]

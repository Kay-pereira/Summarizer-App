from django.urls import path
from summarizer.views import RegisterView, SummarizeView, SummaryListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # app
    path("summarize/", SummarizeView.as_view(), name="summarize"),
    path("summaries/", SummaryListView.as_view(), name="summaries"),
]

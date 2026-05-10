from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import CustomLoginView,RegisterAPIView

urlpatterns = [
    path('login/', CustomLoginView.as_view()),
    path("register/", RegisterAPIView.as_view()),
]
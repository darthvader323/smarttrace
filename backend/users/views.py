from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from rest_framework import status

class RegisterAPIView(APIView):

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=400)

        user = User.objects.create_user(
            username=username,
            password=password
        )

        return Response({"message": "User created successfully"})
class CustomLoginView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):

        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Get token from parent
        response = super().post(request, *args, **kwargs)

        # Add extra data
        response.data["role"] = user.userprofile.role
        response.data["username"] = user.username

        return response
from django.contrib.auth import (
    authenticate,
    get_user_model
)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.views import (
    TokenObtainPairView
)

User = get_user_model()


# =====================================================
# REGISTER API
# =====================================================

class RegisterAPIView(APIView):

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        role = request.data.get(
            "role",
            "SCANNER"
        )

        # Validation
        if not username or not password:

            return Response(
                {
                    "error":
                    "Username and password are required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Username exists
        if User.objects.filter(
            username=username
        ).exists():

            return Response(
                {"error": "User already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            role=role
        )

        return Response({
            "message":
            "User created successfully",

            "username":
            user.username,

            "role":
            user.role
        })


# =====================================================
# LOGIN API
# =====================================================

class CustomLoginView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):

        username = request.data.get(
            "username"
        )

        password = request.data.get(
            "password"
        )

        # Authenticate user
        user = authenticate(
            username=username,
            password=password
        )

        if not user:

            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT token
        response = super().post(
            request,
            *args,
            **kwargs
        )

        # Add extra user data
        response.data["role"] = user.role

        response.data["username"] = user.username

        return response
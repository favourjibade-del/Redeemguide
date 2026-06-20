from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserPreferences, UserActivity
from .serializers import (
    CustomUserSerializer, UserDetailSerializer, UserPreferencesSerializer, 
    UserActivitySerializer, SignupSerializer, AuthResponseSerializer
)

User = get_user_model()


def token_response_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': AuthResponseSerializer(user).data,
    }


class UserTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = AuthResponseSerializer(self.user).data
        return data


class UserTokenObtainPairView(TokenObtainPairView):
    serializer_class = UserTokenObtainPairSerializer


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get('credential')
        client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '')

        if not credential:
            return Response(
                {'detail': 'Google credential is required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if not client_id:
            return Response(
                {'detail': 'Google OAuth is not configured on the server.'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            # Verify the Google OAuth2 token
            payload = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id
            )
        except ValueError as e:
            return Response(
                {'detail': f'Invalid Google credential: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Google authentication error: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extract user information from payload
        email = payload.get('email')
        if not email:
            return Response(
                {'detail': 'Google account did not provide an email address.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate unique username from email
        base_username = email.split('@')[0]
        username = base_username
        suffix = 1
        while User.objects.filter(username=username).exclude(email=email).exists():
            suffix += 1
            username = f'{base_username}{suffix}'

        # Try to get existing user or create new one
        try:
            user = User.objects.get(email=email)
            created = False
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=payload.get('given_name', ''),
                last_name=payload.get('family_name', ''),
            )
            user.is_verified = payload.get('email_verified', False)
            user.set_unusable_password()
            user.save()
            created = True

        # Update existing user if Google provided new information
        if not created:
            changed = False
            for field in ('first_name', 'last_name'):
                value = payload.get('given_name' if field == 'first_name' else 'family_name', '')
                if value and getattr(user, field, '') != value:
                    setattr(user, field, value)
                    changed = True
            
            email_verified = payload.get('email_verified', False)
            if email_verified and not getattr(user, 'is_verified', False):
                user.is_verified = True
                changed = True
            
            if changed:
                user.save()

        return Response(token_response_for_user(user))


class CustomUserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users (CRUD operations)
    """
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        elif self.action == 'register':
            return SignupSerializer
        return CustomUserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current authenticated user"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Register a new user"""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Registration request data: {request.data}")
        
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Return user data only (tokens will be obtained via login)
            user_data = UserDetailSerializer(user).data
            return Response(user_data, status=status.HTTP_201_CREATED)
        
        logger.error(f"Registration validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserPreferencesViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user preferences
    """
    queryset = UserPreferences.objects.all()
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return user's own preferences only"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return UserPreferences.objects.all()
        return UserPreferences.objects.filter(user=self.request.user)


class UserActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing user activity logs
    """
    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return activity logs for current user"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return UserActivity.objects.all()
        return UserActivity.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_activities(self, request):
        """Get current user's activity logs"""
        activities = self.get_queryset()[:100]  # Limit to last 100
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)

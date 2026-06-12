from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import UserPreferences, UserActivity

CustomUser = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer for CustomUser model"""
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_verified', 'is_active',
            'created_at', 'updated_at', 'password'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_verified', 'is_active']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class SignupSerializer(serializers.ModelSerializer):
    """Serializer for user registration/signup"""
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name'
        ]
        read_only_fields = ['id']
    
    def validate_username(self, value):
        if not value or len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value
    
    def validate_first_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("First name is required.")
        return value
    
    def validate_last_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Last name is required.")
        return value
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            password=password
        )
        return user


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for UserPreferences model"""
    
    class Meta:
        model = UserPreferences
        fields = [
            'id', 'user', 'theme', 'notifications_enabled', 'location_tracking_enabled',
            'push_notifications', 'email_notifications', 'sms_notifications',
            'receive_event_updates', 'receive_crowd_alerts', 'receive_emergency_alerts',
            'accessibility_mode', 'large_text_enabled', 'high_contrast_mode',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for UserActivity model"""
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'activity_type', 'description', 'latitude', 'longitude',
            'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserDetailSerializer(serializers.ModelSerializer):
    """Extended user serializer with preferences"""
    password = serializers.CharField(write_only=True, required=False)
    
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_verified', 'is_active',
            'created_at', 'updated_at', 'password'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_verified', 'is_active',]
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class AuthResponseSerializer(serializers.Serializer):
    """Minimal serializer for auth responses"""
    id = serializers.SerializerMethodField()
    username = serializers.CharField()
    email = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    
    def get_id(self, obj):
        return str(obj.id)

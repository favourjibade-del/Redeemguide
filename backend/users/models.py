from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import URLValidator
import uuid


class CustomUser(AbstractUser):
    """Extended user model with additional fields for RedeemGuide"""
    
    USER_TYPE_CHOICES = (
        ('visitor', 'Visitor'),
        ('volunteer', 'Volunteer'),
        ('staff', 'Staff'),
        ('emergency', 'Emergency Personnel'),
        ('admin', 'Administrator'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='visitor')
    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    preferred_language = models.CharField(max_length=10, default='en')
    last_known_location_latitude = models.FloatField(null=True, blank=True)
    last_known_location_longitude = models.FloatField(null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Override groups and user_permissions with proper related_names
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set',
        blank=True,
        help_text='Specific permissions for this user.',
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_type']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.user_type})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


class UserPreferences(models.Model):
    """User preferences for navigation and notifications"""
    
    THEME_CHOICES = (
        ('light', 'Light Theme'),
        ('dark', 'Dark Theme'),
    )
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    notifications_enabled = models.BooleanField(default=True)
    location_tracking_enabled = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    receive_event_updates = models.BooleanField(default=True)
    receive_crowd_alerts = models.BooleanField(default=True)
    receive_emergency_alerts = models.BooleanField(default=True)
    accessibility_mode = models.BooleanField(default=False)
    large_text_enabled = models.BooleanField(default=False)
    high_contrast_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "User Preferences"
    
    def __str__(self):
        return f"Preferences for {self.user.username}"


class UserActivity(models.Model):
    """Track user activities for analytics"""
    
    ACTIVITY_TYPE_CHOICES = (
        ('location_search', 'Location Search'),
        ('navigation_start', 'Navigation Started'),
        ('navigation_end', 'Navigation Ended'),
        ('event_view', 'Event Viewed'),
        ('emergency_alert', 'Emergency Alert Received'),
        ('report_submit', 'Report Submitted'),
        ('help_request', 'Help Request'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPE_CHOICES)
    description = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['activity_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type}"

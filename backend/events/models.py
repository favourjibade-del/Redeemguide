from django.db import models
import uuid


class Event(models.Model):
    """Events at Redemption City"""
    
    EVENT_TYPE_CHOICES = (
        ('conference', 'Conference'),
        ('service', 'Service'),
        ('workshop', 'Workshop'),
        ('prayer_meeting', 'Prayer Meeting'),
        ('concert', 'Concert'),
        ('seminar', 'Seminar'),
        ('social', 'Social Event'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('live', 'Live'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('postponed', 'Postponed'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    location = models.ForeignKey('locations.Location', on_delete=models.SET_NULL, null=True, related_name='events')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    expected_attendance = models.IntegerField(null=True, blank=True)
    speaker_names = models.JSONField(default=list, blank=True)
    image = models.ImageField(upload_to='events/', blank=True)
    banner = models.ImageField(upload_to='event_banners/', blank=True)
    agenda = models.JSONField(default=list, blank=True)  # List of agenda items
    tags = models.JSONField(default=list, blank=True)
    registration_url = models.URLField(blank=True)
    is_free = models.BooleanField(default=True)
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_capacity = models.IntegerField(null=True, blank=True)
    current_attendees = models.IntegerField(default=0)
    requires_registration = models.BooleanField(default=False)
    parent_event = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_events')
    created_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['event_type', 'status']),
            models.Index(fields=['start_time']),
            models.Index(fields=['location']),
        ]
    
    def __str__(self):
        return self.name
    
    def is_ongoing(self):
        from django.utils import timezone
        now = timezone.now()
        return self.start_time <= now <= self.end_time


class EventAttendee(models.Model):
    """Track event attendees"""
    
    REGISTRATION_STATUS_CHOICES = (
        ('registered', 'Registered'),
        ('checked_in', 'Checked In'),
        ('no_show', 'No Show'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='event_registrations')
    registration_status = models.CharField(max_length=20, choices=REGISTRATION_STATUS_CHOICES, default='registered')
    registration_time = models.DateTimeField(auto_now_add=True)
    check_in_time = models.DateTimeField(null=True, blank=True)
    ticket_code = models.CharField(max_length=100, unique=True, blank=True)
    number_of_guests = models.IntegerField(default=1)
    special_requirements = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('event', 'user')
        ordering = ['event', 'registration_time']
    
    def __str__(self):
        return f"{self.user.username} - {self.event.name}"


class EventNotification(models.Model):
    """Notifications for events"""
    
    NOTIFICATION_TYPE_CHOICES = (
        ('event_starting', 'Event Starting'),
        ('event_update', 'Event Update'),
        ('event_cancelled', 'Event Cancelled'),
        ('reminder', 'Reminder'),
        ('alert', 'Alert'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    sent_to_all = models.BooleanField(default=False)
    users = models.ManyToManyField('users.CustomUser', related_name='event_notifications', blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"{self.event.name} - {self.notification_type}"

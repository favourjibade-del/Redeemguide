from django.db import models
import uuid


class EmergencyService(models.Model):
    """Emergency service providers"""
    
    SERVICE_TYPE_CHOICES = (
        ('medical', 'Medical'),
        ('security', 'Security'),
        ('fire', 'Fire'),
        ('police', 'Police'),
        ('rescue', 'Rescue'),
        ('counseling', 'Counseling'),
        ('chaplain', 'Chaplain Services'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES)
    location = models.ForeignKey('locations.Location', on_delete=models.SET_NULL, null=True, related_name='emergency_services')
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    description = models.TextField()
    available_24_7 = models.BooleanField(default=False)
    operating_hours = models.JSONField(default=dict, blank=True)
    staff_count = models.IntegerField(null=True, blank=True)
    equipment_list = models.JSONField(default=list, blank=True)
    response_time_minutes = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['service_type']),
            models.Index(fields=['location']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.service_type})"


class EmergencyReport(models.Model):
    """Emergency reports/incidents"""
    
    EMERGENCY_TYPE_CHOICES = (
        ('medical', 'Medical Emergency'),
        ('security', 'Security Incident'),
        ('fire', 'Fire/Smoke'),
        ('accident', 'Accident'),
        ('missing_person', 'Missing Person'),
        ('hazard', 'Environmental Hazard'),
        ('crowd_crush', 'Crowd Crush Risk'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('reported', 'Reported'),
        ('confirmed', 'Confirmed'),
        ('response_sent', 'Response Sent'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('false_alarm', 'False Alarm'),
    )
    
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emergency_type = models.CharField(max_length=50, choices=EMERGENCY_TYPE_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    location = models.ForeignKey('locations.Location', on_delete=models.SET_NULL, null=True, blank=True, related_name='emergency_reports')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    reporter = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='emergency_reports')
    description = models.TextField()
    people_affected_count = models.IntegerField(null=True, blank=True)
    injuries_reported = models.BooleanField(default=False)
    medical_attention_needed = models.BooleanField(default=False)
    additional_notes = models.TextField(blank=True)
    photo = models.ImageField(upload_to='emergency_reports/', blank=True)
    video_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'severity']),
            models.Index(fields=['emergency_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.emergency_type} - {self.severity}"


class EmergencyResponse(models.Model):
    """Emergency service responses to reports"""
    
    RESPONSE_STATUS_CHOICES = (
        ('dispatched', 'Dispatched'),
        ('en_route', 'En Route'),
        ('on_scene', 'On Scene'),
        ('assisting', 'Assisting'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emergency_report = models.ForeignKey(EmergencyReport, on_delete=models.CASCADE, related_name='responses')
    emergency_service = models.ForeignKey(EmergencyService, on_delete=models.SET_NULL, null=True, related_name='responses')
    responder = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='emergency_responses')
    status = models.CharField(max_length=20, choices=RESPONSE_STATUS_CHOICES, default='dispatched')
    arrival_time = models.DateTimeField(null=True, blank=True)
    departure_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    actions_taken = models.JSONField(default=list, blank=True)
    vehicles_dispatched = models.JSONField(default=list, blank=True)  # List of vehicle IDs/info
    personnel_assigned = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Response to {self.emergency_report.id}"


class SafetyTip(models.Model):
    """Safety tips and guidelines"""
    
    CATEGORY_CHOICES = (
        ('crowd_safety', 'Crowd Safety'),
        ('health', 'Health'),
        ('security', 'Security'),
        ('accessibility', 'Accessibility'),
        ('weather', 'Weather'),
        ('first_aid', 'First Aid'),
        ('emergency_procedures', 'Emergency Procedures'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    content = models.TextField()
    icon = models.ImageField(upload_to='safety_tips/', blank=True)
    priority = models.IntegerField(choices=[(i, i) for i in range(1, 6)], default=3)  # 1-5
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return self.title


class IncidentHistory(models.Model):
    """Historical incident data for analytics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='incident_history')
    date = models.DateField()
    total_incidents = models.IntegerField(default=0)
    medical_incidents = models.IntegerField(default=0)
    security_incidents = models.IntegerField(default=0)
    other_incidents = models.IntegerField(default=0)
    average_response_time_minutes = models.FloatField(null=True, blank=True)
    critical_incidents = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('location', 'date')
        ordering = ['-date']
    
    def __str__(self):
        return f"Incidents at {self.location.name} on {self.date}"

from django.db import models
import uuid


class CrowdDensity(models.Model):
    """Real-time crowd density data"""
    
    DENSITY_LEVEL_CHOICES = (
        ('empty', 'Empty'),
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
        ('very_high', 'Very High'),
        ('critical', 'Critical'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='crowd_densities')
    density_level = models.CharField(max_length=20, choices=DENSITY_LEVEL_CHOICES)
    estimated_people_count = models.IntegerField()
    percentage_capacity = models.FloatField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['location', 'recorded_at']),
            models.Index(fields=['density_level']),
        ]
    
    def __str__(self):
        return f"{self.location.name} - {self.density_level}"


class CrowdFlow(models.Model):
    """Track crowd movement patterns"""
    
    FLOW_DIRECTION_CHOICES = (
        ('north', 'North'),
        ('south', 'South'),
        ('east', 'East'),
        ('west', 'West'),
        ('northeast', 'Northeast'),
        ('northwest', 'Northwest'),
        ('southeast', 'Southeast'),
        ('southwest', 'Southwest'),
    )
    
    FLOW_SPEED_CHOICES = (
        ('stationary', 'Stationary'),
        ('slow', 'Slow'),
        ('normal', 'Normal'),
        ('fast', 'Fast'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    start_location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='crowd_flow_from')
    end_location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='crowd_flow_to')
    direction = models.CharField(max_length=20, choices=FLOW_DIRECTION_CHOICES)
    speed = models.CharField(max_length=20, choices=FLOW_SPEED_CHOICES)
    estimated_flow_rate = models.IntegerField()  # people per minute
    congestion_level = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 scale
    incident_reported = models.BooleanField(default=False)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['start_location', 'end_location']),
            models.Index(fields=['recorded_at']),
        ]
    
    def __str__(self):
        return f"{self.start_location.name} → {self.end_location.name}"


class CrowdAlert(models.Model):
    """Alerts about crowd situations"""
    
    ALERT_TYPE_CHOICES = (
        ('congestion', 'Congestion'),
        ('bottleneck', 'Bottleneck'),
        ('unusual_activity', 'Unusual Activity'),
        ('infrastructure_issue', 'Infrastructure Issue'),
        ('safety_concern', 'Safety Concern'),
        ('weather_impact', 'Weather Impact'),
    )
    
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('monitoring', 'Monitoring'),
        ('resolved', 'Resolved'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='crowd_alerts')
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPE_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    title = models.CharField(max_length=200)
    description = models.TextField()
    recommendations = models.JSONField(default=list, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    radius_meters = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_crowd_alerts')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'severity']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.alert_type} - {self.location.name}"


class PredictedCongestion(models.Model):
    """AI predictions for future congestion"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='predicted_congestion')
    predicted_time = models.DateTimeField()
    predicted_crowd_percentage = models.FloatField()
    confidence_level = models.FloatField()  # 0-1
    recommendation = models.TextField(blank=True)
    prediction_made_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['predicted_time']
        indexes = [
            models.Index(fields=['location', 'predicted_time']),
        ]
    
    def __str__(self):
        return f"Congestion Prediction: {self.location.name}"


class CrowdBehaviorMetric(models.Model):
    """Historical crowd behavior metrics for analytics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='behavior_metrics')
    date = models.DateField()
    peak_occupancy_time = models.TimeField()
    peak_occupancy_percentage = models.FloatField()
    average_occupancy_percentage = models.FloatField()
    total_visitors_count = models.IntegerField()
    average_dwell_time_minutes = models.IntegerField()
    flow_efficiency_score = models.FloatField()  # 0-100
    incident_count = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('location', 'date')
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.location.name} - {self.date}"

from django.db import models
import uuid


class Route(models.Model):
    """Routes between locations"""
    
    ROUTE_TYPE_CHOICES = (
        ('pedestrian', 'Pedestrian'),
        ('vehicle', 'Vehicle'),
        ('shuttle', 'Shuttle'),
        ('emergency', 'Emergency'),
    )
    
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('difficult', 'Difficult'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    start_location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='routes_from')
    end_location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='routes_to')
    route_type = models.CharField(max_length=20, choices=ROUTE_TYPE_CHOICES)
    distance_km = models.FloatField()
    estimated_time_minutes = models.IntegerField()
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='moderate')
    waypoints = models.JSONField(default=list, blank=True)  # List of coordinates
    description = models.TextField(blank=True)
    is_accessible = models.BooleanField(default=True)
    wheelchair_accessible = models.BooleanField(default=False)
    has_stairs = models.BooleanField(default=False)
    has_elevators = models.BooleanField(default=False)
    outdoor = models.BooleanField(default=True)
    hazards = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['start_location', 'end_location']),
            models.Index(fields=['route_type']),
        ]
    
    def __str__(self):
        return f"{self.start_location.name} → {self.end_location.name}"


class Navigation(models.Model):
    """User navigation sessions"""
    
    STATUS_CHOICES = (
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='navigations')
    start_location = models.ForeignKey('locations.Location', on_delete=models.SET_NULL, null=True, related_name='navigation_starts')
    destination = models.ForeignKey('locations.Location', on_delete=models.SET_NULL, null=True, related_name='navigation_destinations')
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='started')
    current_latitude = models.FloatField(null=True, blank=True)
    current_longitude = models.FloatField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    estimated_arrival_time = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    feedback_rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
    feedback_comment = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['started_at']),
        ]
    
    def __str__(self):
        return f"Navigation by {self.user.username}"


class NavigationCheckpoint(models.Model):
    """Waypoints during navigation"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    navigation = models.ForeignKey(Navigation, on_delete=models.CASCADE, related_name='checkpoints')
    location = models.ForeignKey('locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
    sequence = models.IntegerField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    reached_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['navigation', 'sequence']
        unique_together = ('navigation', 'sequence')
    
    def __str__(self):
        return f"Checkpoint {self.sequence} - {self.navigation.id}"


class Landmark(models.Model):
    """Landmarks along routes"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    image = models.ImageField(upload_to='landmarks/', blank=True)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='landmarks')
    sequence = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['route', 'sequence']
    
    def __str__(self):
        return self.name

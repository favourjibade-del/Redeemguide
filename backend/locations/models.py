from django.db import models
import uuid


class LocationCategory(models.Model):
    """Categories of locations within Redemption City"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='location_icons/', blank=True)
    color_code = models.CharField(max_length=7, default='#0000FF')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Location Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Location(models.Model):
    """Physical locations within Redemption City"""
    
    LOCATION_TYPE_CHOICES = (
        ('auditorium', 'Auditorium'),
        ('accommodation', 'Accommodation'),
        ('healthcare', 'Healthcare Facility'),
        ('dining', 'Dining Facility'),
        ('parking', 'Parking Area'),
        ('shuttle_stop', 'Shuttle Stop'),
        ('restroom', 'Restroom'),
        ('emergency', 'Emergency Service'),
        ('office', 'Office'),
        ('retail', 'Retail Shop'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('closed', 'Closed'),
        ('inactive', 'Inactive'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    location_type = models.CharField(max_length=50, choices=LOCATION_TYPE_CHOICES)
    category = models.ForeignKey(LocationCategory, on_delete=models.SET_NULL, null=True, related_name='locations')
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=255)
    building_code = models.CharField(max_length=50, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    current_occupancy = models.IntegerField(default=0)
    operating_hours = models.JSONField(default=dict, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    business_name = models.CharField(max_length=200, blank=True)
    business_website = models.URLField(blank=True)
    amenities = models.JSONField(default=list, blank=True)  # List of amenities
    accessibility_features = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    image = models.ImageField(upload_to='locations/', blank=True)
    floor_number = models.IntegerField(null=True, blank=True)
    room_number = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['location_type']),
            models.Index(fields=['status']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return self.name
    
    def occupancy_percentage(self):
        if self.capacity:
            return (self.current_occupancy / self.capacity) * 100
        return 0


class LocationReview(models.Model):
    """Reviews and ratings for locations"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, related_name='location_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=100)
    review_text = models.TextField()
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('location', 'user')
    
    def __str__(self):
        return f"Review for {self.location.name}"


class LocationHours(models.Model):
    """Operating hours for locations"""
    
    DAYS = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )
    
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='hours')
    day = models.CharField(max_length=20, choices=DAYS)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    is_closed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('location', 'day')
        ordering = ['location', 'day']
    
    def __str__(self):
        return f"{self.location.name} - {self.get_day_display()}"

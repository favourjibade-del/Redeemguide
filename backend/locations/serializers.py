from rest_framework import serializers
from .models import Location, LocationCategory, LocationReview, LocationHours


class LocationCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationCategory
        fields = '__all__'


class LocationHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationHours
        fields = '__all__'


class LocationReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = LocationReview
        fields = ['id', 'location', 'user', 'user_name', 'rating', 'title', 'review_text', 'helpful_count', 'created_at']
        read_only_fields = ['id', 'created_at']


class LocationSerializer(serializers.ModelSerializer):
    reviews = LocationReviewSerializer(many=True, read_only=True)
    hours = LocationHoursSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    occupancy_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = [
            'id', 'name', 'description', 'location_type', 'category', 'category_name',
            'latitude', 'longitude', 'address', 'building_code', 'capacity', 
            'current_occupancy', 'occupancy_percentage', 'operating_hours', 
            'contact_phone', 'contact_email', 'business_name', 'business_website',
            'amenities', 'accessibility_features',
            'status', 'image', 'floor_number', 'room_number', 'reviews', 'hours',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_occupancy_percentage(self, obj):
        return obj.occupancy_percentage()


class LocationDetailSerializer(LocationSerializer):
    """Extended serializer with all related data"""
    pass

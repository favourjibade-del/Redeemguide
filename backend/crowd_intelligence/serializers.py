from rest_framework import serializers
from .models import CrowdDensity, CrowdAlert, CrowdFlow


class CrowdDensitySerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    
    class Meta:
        model = CrowdDensity
        fields = ['id', 'location', 'location_name', 'density_level', 'estimated_people_count',
                  'percentage_capacity', 'recorded_at', 'created_at']
        read_only_fields = ['id', 'created_at']


class CrowdFlowSerializer(serializers.ModelSerializer):
    start_location_name = serializers.CharField(source='start_location.name', read_only=True)
    end_location_name = serializers.CharField(source='end_location.name', read_only=True)
    
    class Meta:
        model = CrowdFlow
        fields = ['id', 'start_location', 'start_location_name', 'end_location',
                  'end_location_name', 'direction', 'speed', 'estimated_flow_rate',
                  'congestion_level', 'incident_reported', 'recorded_at', 'created_at']
        read_only_fields = ['id', 'created_at']


class CrowdAlertSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    creator_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = CrowdAlert
        fields = ['id', 'location', 'location_name', 'alert_type', 'severity', 'status',
                  'title', 'description', 'recommendations', 'latitude', 'longitude',
                  'radius_meters', 'created_by', 'creator_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

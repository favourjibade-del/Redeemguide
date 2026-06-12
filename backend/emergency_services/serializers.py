from rest_framework import serializers
from .models import EmergencyService, EmergencyReport, SafetyTip


class EmergencyServiceSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    
    class Meta:
        model = EmergencyService
        fields = ['id', 'name', 'service_type', 'location', 'location_name', 'phone',
                  'email', 'description', 'available_24_7', 'operating_hours',
                  'staff_count', 'equipment_list', 'response_time_minutes',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SafetyTipSerializer(serializers.ModelSerializer):
    class Meta:
        model = SafetyTip
        fields = ['id', 'title', 'category', 'content', 'icon', 'priority',
                  'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmergencyReportSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    
    class Meta:
        model = EmergencyReport
        fields = ['id', 'emergency_type', 'severity', 'status', 'location',
                  'location_name', 'latitude', 'longitude', 'reporter', 'reporter_name',
                  'description', 'people_affected_count', 'injuries_reported',
                  'medical_attention_needed', 'photo', 'video_url',
                  'created_at', 'resolved_at']
        read_only_fields = ['id', 'created_at', 'resolved_at']

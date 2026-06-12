from rest_framework import serializers
from .models import Route, Navigation, NavigationCheckpoint, Landmark


class LandmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Landmark
        fields = '__all__'


class NavigationCheckpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavigationCheckpoint
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class NavigationSerializer(serializers.ModelSerializer):
    checkpoints = NavigationCheckpointSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Navigation
        fields = [
            'id', 'user', 'user_name', 'route', 'start_location', 'end_location',
            'status', 'current_latitude', 'current_longitude', 'started_at',
            'estimated_arrival', 'completed_at', 'feedback_rating', 'feedback_comment',
            'checkpoints', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'started_at', 'created_at', 'updated_at']

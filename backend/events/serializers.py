from rest_framework import serializers
from .models import Event, EventAttendee


class EventAttendeeSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = EventAttendee
        fields = [
            'id', 'event', 'user', 'user_name', 'registration_status',
            'registration_time', 'check_in_time', 'ticket_code',
            'number_of_guests', 'special_requirements'
        ]
        read_only_fields = ['id', 'user', 'ticket_code', 'registration_time', 'check_in_time']


class EventSerializer(serializers.ModelSerializer):
    attendees = EventAttendeeSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    location_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'description', 'event_type', 'status',
            'location', 'manual_location', 'location_name', 'created_by', 'created_by_name',
            'start_time', 'end_time', 'expected_attendance', 'current_attendees',
            'speaker_names', 'image', 'banner', 'agenda', 'tags',
            'registration_url', 'is_free', 'ticket_price', 'max_capacity',
            'requires_registration', 'attendees', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_location_name(self, obj):
        if obj.location:
            return obj.location.name
        return obj.manual_location


class EventDetailSerializer(EventSerializer):
    """Extended serializer with all event details"""
    pass

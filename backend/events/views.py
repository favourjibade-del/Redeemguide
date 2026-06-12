from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Event, EventAttendee
from .serializers import EventSerializer, EventAttendeeSerializer


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for events"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'status', 'location']
    search_fields = ['name', 'description']
    ordering_fields = ['start_time', 'created_at']
    ordering = ['start_time']
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        upcoming = Event.objects.filter(
            start_time__gte=timezone.now(),
            status='upcoming'
        ).order_by('start_time')
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def live(self, request):
        """Get currently live events"""
        now = timezone.now()
        live = Event.objects.filter(
            start_time__lte=now,
            end_time__gte=now,
            status='live'
        )
        serializer = self.get_serializer(live, many=True)
        return Response(serializer.data)


class EventAttendeeViewSet(viewsets.ModelViewSet):
    """ViewSet for event attendees"""
    queryset = EventAttendee.objects.all()
    serializer_class = EventAttendeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return user's own registrations"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return EventAttendee.objects.all()
        return EventAttendee.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in attendee to event"""
        attendee = self.get_object()
        attendee.registration_status = 'checked_in'
        attendee.check_in_time = timezone.now()
        attendee.save()
        return Response({'status': 'checked in'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel event registration"""
        attendee = self.get_object()
        attendee.registration_status = 'cancelled'
        attendee.save()
        return Response({'status': 'registration cancelled'})

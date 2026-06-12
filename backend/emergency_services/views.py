from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import EmergencyService, EmergencyReport, SafetyTip
from .serializers import EmergencyServiceSerializer, EmergencyReportSerializer, SafetyTipSerializer


class EmergencyServiceViewSet(viewsets.ModelViewSet):
    """ViewSet for emergency services"""
    queryset = EmergencyService.objects.all()
    serializer_class = EmergencyServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['service_type', 'location']
    search_fields = ['name', 'description']
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get nearby emergency services"""
        lat = request.query_params.get('latitude')
        lon = request.query_params.get('longitude')
        
        if not lat or not lon:
            return Response(
                {'error': 'latitude and longitude parameters required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lat, lon = float(lat), float(lon)
        nearby = []
        
        for service in self.get_queryset():
            dlat = abs(service.location.latitude - lat)
            dlon = abs(service.location.longitude - lon)
            distance = ((dlat ** 2 + dlon ** 2) ** 0.5) * 111
            
            if distance <= 5:  # Within 5 km
                nearby.append(service)
        
        serializer = self.get_serializer(nearby, many=True)
        return Response(serializer.data)


class SafetyTipViewSet(viewsets.ModelViewSet):
    """ViewSet for safety tips"""
    queryset = SafetyTip.objects.all()
    serializer_class = SafetyTipSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['title', 'content']
    
    @action(detail=False, methods=['get'])
    def active_tips(self, request):
        """Get all active safety tips"""
        active = SafetyTip.objects.filter(is_active=True).order_by('-priority')
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)


class EmergencyReportViewSet(viewsets.ModelViewSet):
    """ViewSet for emergency reports"""
    queryset = EmergencyReport.objects.all()
    serializer_class = EmergencyReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['emergency_type', 'severity', 'status', 'location']
    ordering_fields = ['created_at', 'severity']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return user's own reports or all if staff"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return EmergencyReport.objects.all()
        return EmergencyReport.objects.filter(reporter=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        """Resolve emergency report"""
        from django.utils import timezone
        report = self.get_object()
        report.status = 'resolved'
        report.resolved_at = timezone.now()
        report.save()
        return Response({'status': 'report resolved'})
    
    @action(detail=False, methods=['get'])
    def critical(self, request):
        """Get critical emergency reports"""
        critical = EmergencyReport.objects.filter(
            severity__in=['high', 'critical'],
            status__in=['reported', 'confirmed', 'response_sent']
        ).order_by('-created_at')
        
        serializer = self.get_serializer(critical, many=True)
        return Response(serializer.data)

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import CrowdDensity, CrowdAlert, CrowdFlow
from .serializers import CrowdDensitySerializer, CrowdAlertSerializer, CrowdFlowSerializer


class CrowdDensityViewSet(viewsets.ModelViewSet):
    """ViewSet for crowd density data"""
    queryset = CrowdDensity.objects.all()
    serializer_class = CrowdDensitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['location', 'density_level']
    ordering_fields = ['recorded_at', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest crowd density for each location"""
        from django.db.models import Max
        latest_records = CrowdDensity.objects.values('location').annotate(
            latest_id=Max('id')
        ).values_list('latest_id', flat=True)
        
        latest = CrowdDensity.objects.filter(id__in=latest_records)
        serializer = self.get_serializer(latest, many=True)
        return Response(serializer.data)


class CrowdFlowViewSet(viewsets.ModelViewSet):
    """ViewSet for crowd flow data"""
    queryset = CrowdFlow.objects.all()
    serializer_class = CrowdFlowSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['start_location', 'end_location', 'direction']
    ordering_fields = ['recorded_at', 'created_at']
    ordering = ['-created_at']


class CrowdAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for crowd alerts"""
    queryset = CrowdAlert.objects.all()
    serializer_class = CrowdAlertSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'alert_type', 'severity', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'severity']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve an alert"""
        alert = self.get_object()
        alert.status = 'resolved'
        alert.save()
        return Response({'status': 'alert resolved'})
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active alerts only"""
        active = CrowdAlert.objects.filter(status__in=['active', 'monitoring'])
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Route, Navigation, NavigationCheckpoint
from .serializers import RouteSerializer, NavigationSerializer, NavigationCheckpointSerializer


class RouteViewSet(viewsets.ModelViewSet):
    """ViewSet for routes"""
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class NavigationViewSet(viewsets.ModelViewSet):
    """ViewSet for navigation sessions"""
    queryset = Navigation.objects.all()
    serializer_class = NavigationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return user's own navigation sessions"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Navigation.objects.all()
        return Navigation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark navigation as completed"""
        navigation = self.get_object()
        navigation.status = 'completed'
        navigation.save()
        return Response({'status': 'navigation completed'})
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause navigation"""
        navigation = self.get_object()
        navigation.status = 'paused'
        navigation.save()
        return Response({'status': 'navigation paused'})
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume paused navigation"""
        navigation = self.get_object()
        navigation.status = 'in_progress'
        navigation.save()
        return Response({'status': 'navigation resumed'})

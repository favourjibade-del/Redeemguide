from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Location, LocationCategory, LocationReview
from .serializers import LocationSerializer, LocationCategorySerializer, LocationReviewSerializer


class LocationCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for location categories"""
    queryset = LocationCategory.objects.all()
    serializer_class = LocationCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class LocationReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for location reviews"""
    queryset = LocationReview.objects.all()
    serializer_class = LocationReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LocationViewSet(viewsets.ModelViewSet):
    """ViewSet for locations"""
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location_type', 'status', 'category']
    search_fields = ['name', 'description', 'building_code']
    ordering_fields = ['name', 'capacity', 'current_occupancy', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get nearby locations based on latitude and longitude"""
        lat = request.query_params.get('latitude')
        lon = request.query_params.get('longitude')
        radius = float(request.query_params.get('radius', 1))  # radius in km
        
        if not lat or not lon:
            return Response(
                {'error': 'latitude and longitude parameters required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simple distance calculation (not perfect but works for demo)
        lat, lon = float(lat), float(lon)
        nearby_locs = []
        
        for loc in self.get_queryset():
            # Haversine formula simplified
            dlat = abs(loc.latitude - lat)
            dlon = abs(loc.longitude - lon)
            distance = ((dlat ** 2 + dlon ** 2) ** 0.5) * 111  # approximate km
            
            if distance <= radius:
                nearby_locs.append(loc)
        
        serializer = self.get_serializer(nearby_locs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_occupancy(self, request, pk=None):
        """Update current occupancy of a location"""
        location = self.get_object()
        occupancy = request.data.get('occupancy')
        
        if occupancy is None:
            return Response(
                {'error': 'occupancy parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        location.current_occupancy = int(occupancy)
        location.save()
        
        return Response({
            'occupancy': location.current_occupancy,
            'occupancy_percentage': location.occupancy_percentage()
        })

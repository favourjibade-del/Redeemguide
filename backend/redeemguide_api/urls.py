"""
URL configuration for RedeemGuide SaaS API.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# Import viewsets from apps
from users.views import CustomUserViewSet, UserPreferencesViewSet, UserActivityViewSet, GoogleAuthView, UserTokenObtainPairView
from locations.views import LocationViewSet, LocationCategoryViewSet, LocationReviewViewSet
from navigation.views import RouteViewSet, NavigationViewSet
from events.views import EventViewSet, EventAttendeeViewSet
from crowd_intelligence.views import CrowdDensityViewSet, CrowdAlertViewSet, CrowdFlowViewSet
from emergency_services.views import EmergencyServiceViewSet, EmergencyReportViewSet, SafetyTipViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'users', CustomUserViewSet, basename='user')
router.register(r'user-preferences', UserPreferencesViewSet, basename='user-preferences')
router.register(r'user-activities', UserActivityViewSet, basename='user-activity')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'location-categories', LocationCategoryViewSet, basename='location-category')
router.register(r'location-reviews', LocationReviewViewSet, basename='location-review')
router.register(r'routes', RouteViewSet, basename='route')
router.register(r'navigation', NavigationViewSet, basename='navigation')
router.register(r'events', EventViewSet, basename='event')
router.register(r'event-attendees', EventAttendeeViewSet, basename='event-attendee')
router.register(r'crowd-density', CrowdDensityViewSet, basename='crowd-density')
router.register(r'crowd-alerts', CrowdAlertViewSet, basename='crowd-alert')
router.register(r'crowd-flow', CrowdFlowViewSet, basename='crowd-flow')
router.register(r'emergency-services', EmergencyServiceViewSet, basename='emergency-service')
router.register(r'emergency-reports', EmergencyReportViewSet, basename='emergency-report')
router.register(r'safety-tips', SafetyTipViewSet, basename='safety-tip')

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),
    
    # API Authentication
    path('api/token/', UserTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/token/', UserTokenObtainPairView.as_view(), name='v1_token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='v1_token_refresh'),
    path('api/v1/auth/google/', GoogleAuthView.as_view(), name='google_auth'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API Routes
    path('api/v1/', include(router.urls)),
    
    # DRF Authentication
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

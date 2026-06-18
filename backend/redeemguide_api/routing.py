from django.urls import re_path

from crowd_intelligence import consumers

websocket_urlpatterns = [
    re_path(r'ws/crowd-density/$', consumers.CrowdDensityConsumer.as_asgi()),
    # Add other WebSocket consumers here as needed
]

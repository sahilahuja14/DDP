from django.contrib import admin
from .models import Detection


@admin.register(Detection)
class DetectionAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "has_drone_alert", "max_confidence", "latitude", "longitude")
    search_fields = ("address",)
    list_filter = ("has_drone_alert", "created_at")


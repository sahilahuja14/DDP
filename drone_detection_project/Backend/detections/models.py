from django.db import models


class Detection(models.Model):
    image = models.ImageField(upload_to="uploads/%Y/%m/%d/")
    created_at = models.DateTimeField(auto_now_add=True)

    # List of {label, confidence, bbox:[x1,y1,x2,y2]}
    detections = models.JSONField(default=list, blank=True)

    max_confidence = models.FloatField(null=True, blank=True)
    has_drone_alert = models.BooleanField(default=False)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    # Telemetry stub (optional)
    telemetry = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return f"Detection {self.pk} @ {self.created_at.isoformat()}"


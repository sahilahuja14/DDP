from rest_framework import serializers
from .models import Detection


class DetectionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Detection
        fields = [
            "id",
            "created_at",
            "image_url",
            "detections",
            "max_confidence",
            "has_drone_alert",
            "latitude",
            "longitude",
            "address",
            "telemetry",
        ]

    def get_image_url(self, obj: Detection):
        request = self.context.get("request")
        if not obj.image:
            return None
        if request is None:
            return obj.image.url
        return request.build_absolute_uri(obj.image.url)


class UploadDetectResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    annotated_image_base64 = serializers.CharField()
    detections = serializers.ListField(child=serializers.DictField())
    gps = serializers.DictField()
    telemetry = serializers.DictField()
    alert = serializers.DictField()


import json
import logging
from pathlib import Path

from django.conf import settings
from django.db.models import Count, Q
from django.http import FileResponse, Http404
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from .models import Detection
from .serializers import DetectionSerializer
from .yolo_service import run_inference, extract_gps_and_telemetry
from .reporting import build_detection_report_json, build_detection_report_pdf_bytes
from .training_stub import run_fake_training
from .email_service import send_drone_alert_email
from datetime import datetime

logger = logging.getLogger(__name__)


class DetectView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"error": "No image file uploaded with key 'image'."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            raw_bytes = image_file.read()
            if len(raw_bytes) == 0:
                return Response({"error": "Uploaded image file is empty."}, status=status.HTTP_400_BAD_REQUEST)

            gps, telemetry = extract_gps_and_telemetry(raw_bytes)

            # Optional client-supplied coordinates
            lat_str = request.data.get("latitude")
            lon_str = request.data.get("longitude")
            if lat_str and lon_str:
                try:
                    lat = float(lat_str)
                    lon = float(lon_str)
                    gps["has_gps"] = True
                    gps["latitude"] = lat
                    gps["longitude"] = lon
                    if not gps.get("address"):
                        from geopy.geocoders import Nominatim
                        geolocator = Nominatim(user_agent="drone-detect-app")
                        location = geolocator.reverse((lat, lon), zoom=18, language="en")
                        gps["address"] = location.address if location else None
                except (TypeError, ValueError):
                    pass
            
            annotated_b64, detections, alert = run_inference(raw_bytes)

            det_obj = Detection.objects.create(
                image=image_file,
                detections=detections,
                max_confidence=alert.get("max_confidence"),
                has_drone_alert=alert.get("is_red_alert", False),
                latitude=gps.get("latitude"),
                longitude=gps.get("longitude"),
                address=gps.get("address"),
                telemetry=telemetry,
            )

            # Format detections for response
            formatted_detections = [
                {
                    "name": d.get("label"),
                    "confidence": d.get("confidence"),
                }
                for d in detections
            ]

            response_payload = {
                "id": det_obj.id,
                "annotatedImage": annotated_b64,
                "detections": formatted_detections,
                "location": {
                    "coordinates": (
                        {
                            "lat": gps.get("latitude"),
                            "lon": gps.get("longitude"),
                        }
                        if gps.get("latitude") is not None and gps.get("longitude") is not None
                        else None
                    ),
                    "address": gps.get("address") or "No GPS metadata found in image.",
                },
                "telemetry": telemetry,
                "alert": alert,
            }
            
            # Send email alert if this is a red alert
            if alert.get("is_red_alert", False):
                logger.info(f"🚨 Red alert detected! Attempting to send email...")
                try:
                    email_data = {
                        "id": det_obj.id,
                        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
                        "detections": formatted_detections,
                        "location": {
                            "coordinates": {
                                "lat": gps.get("latitude"),
                                "lon": gps.get("longitude"),
                            } if gps.get("latitude") and gps.get("longitude") else None,
                            "address": gps.get("address") or "Location not available",
                        },
                        "alert": alert,
                    }
                    
                    email_sent = send_drone_alert_email(email_data)
                    if email_sent:
                        logger.info(f"✅ Email alert sent successfully for detection {det_obj.id}")
                    else:
                        logger.warning(f"⚠️  Email alert was not sent for detection {det_obj.id}")
                        
                except Exception as email_error:
                    logger.error(f"❌ Failed to send email alert: {str(email_error)}", exc_info=True)
            else:
                logger.info(f"ℹ️  No red alert (confidence: {alert.get('drone_max_confidence', 0)*100:.1f}%), email not sent")
            
            return Response(response_payload, status=status.HTTP_201_CREATED)
            
        except Exception as exc:
            logger.error(f"Error in DetectView: {str(exc)}", exc_info=True)
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DetectionListView(generics.ListAPIView):
    queryset = Detection.objects.all().order_by("-created_at")
    serializer_class = DetectionSerializer


class DetectionDetailView(generics.RetrieveAPIView):
    queryset = Detection.objects.all()
    serializer_class = DetectionSerializer


class DetectionReportJSONView(APIView):
    def get(self, request, pk: int, *args, **kwargs):
        try:
            det = Detection.objects.get(pk=pk)
        except Detection.DoesNotExist:
            raise Http404
        payload = build_detection_report_json(det)
        return Response(payload, status=status.HTTP_200_OK)


def detection_report_pdf(request, pk: int, *args, **kwargs):
    try:
        det = Detection.objects.get(pk=pk)
    except Detection.DoesNotExist:
        raise Http404

    pdf_bytes = build_detection_report_pdf_bytes(det)
    return FileResponse(
        pdf_bytes,
        as_attachment=True,
        filename=f"detection-report-{pk}.pdf",
        content_type="application/pdf",
    )


class AnalyticsSummaryView(APIView):
    def get(self, request, *args, **kwargs):
        total = Detection.objects.count()
        total_alerts = Detection.objects.filter(has_drone_alert=True).count()
        total_with_gps = Detection.objects.filter(latitude__isnull=False, longitude__isnull=False).count()

        label_counts = {}
        for det in Detection.objects.all():
            for d in det.detections or []:
                label = str(d.get("label", "unknown"))
                label_counts[label] = label_counts.get(label, 0) + 1

        return Response(
            {
                "total_detections": total,
                "total_red_alerts": total_alerts,
                "detections_with_gps": total_with_gps,
                "label_distribution": label_counts,
            }
        )


@api_view(["POST"])
def start_fake_training(request):
    base_dir = Path(settings.BASE_DIR)
    log_path = base_dir / "training_logs.jsonl"
    run_fake_training(log_path)
    return Response({"status": "started", "log_path": str(log_path)}, status=status.HTTP_200_OK)


class TrainingLogsView(APIView):
    def get(self, request, *args, **kwargs):
        log_file = Path(settings.BASE_DIR) / "training_logs.jsonl"
        if not log_file.exists():
            return Response({"logs": []})
        logs = []
        with log_file.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    logs.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return Response({"logs": logs})
import json
from io import BytesIO
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from .models import Detection


def build_detection_report_json(det: Detection) -> Dict[str, Any]:
    return {
        "id": det.id,
        "created_at": det.created_at.isoformat(),
        "image_url": det.image.url if det.image else None,
        "detections": det.detections,
        "max_confidence": det.max_confidence,
        "has_drone_alert": det.has_drone_alert,
        "gps": {
            "latitude": det.latitude,
            "longitude": det.longitude,
            "address": det.address,
        },
        "telemetry": det.telemetry,
    }


def build_detection_report_pdf_bytes(det: Detection) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    w, h = letter

    y = h - 48
    c.setFont("Helvetica-Bold", 16)
    c.drawString(48, y, "Drone Detection Report")
    y -= 28

    c.setFont("Helvetica", 11)
    c.drawString(48, y, f"Report ID: {det.id}")
    y -= 16
    c.drawString(48, y, f"Timestamp (UTC): {det.created_at.isoformat()}")
    y -= 16
    c.drawString(48, y, f"Red Alert: {'YES' if det.has_drone_alert else 'NO'}")
    y -= 16
    c.drawString(48, y, f"Max Confidence: {det.max_confidence if det.max_confidence is not None else 'N/A'}")
    y -= 24

    c.setFont("Helvetica-Bold", 12)
    c.drawString(48, y, "Location")
    y -= 16
    c.setFont("Helvetica", 11)
    c.drawString(48, y, f"Lat/Lon: {det.latitude if det.latitude is not None else 'N/A'}, {det.longitude if det.longitude is not None else 'N/A'}")
    y -= 16
    addr = det.address or "N/A"
    c.drawString(48, y, f"Address: {addr[:90]}")
    y -= 24

    c.setFont("Helvetica-Bold", 12)
    c.drawString(48, y, "Detections")
    y -= 16
    c.setFont("Helvetica", 10)
    if det.detections:
        for d in det.detections[:20]:
            line = f"- {d.get('label')}  conf={d.get('confidence')}"
            c.drawString(52, y, line[:120])
            y -= 14
            if y < 72:
                c.showPage()
                y = h - 48
                c.setFont("Helvetica", 10)
    else:
        c.drawString(52, y, "No detections.")
        y -= 14

    c.showPage()
    c.save()
    return buf.getvalue()


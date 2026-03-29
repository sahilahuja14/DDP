import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from datetime import datetime
import ssl

# Fix SSL certificate issues for email
ssl._create_default_https_context = ssl._create_unverified_context

logger = logging.getLogger(__name__)


def send_drone_alert_email(detection_data):
    """
    Send an email alert when a drone is detected.
    
    Args:
        detection_data: Dictionary containing detection information
    """
    try:
        logger.info(f"send_drone_alert_email called with data: {detection_data}")
        
        recipient_email = settings.ALERT_EMAIL_RECIPIENT
        
        if not recipient_email:
            logger.warning("ALERT_EMAIL_RECIPIENT not configured, skipping email")
            return False
        
        # Extract detection information
        detections = detection_data.get('detections', [])
        location = detection_data.get('location', {})
        alert = detection_data.get('alert', {})
        detection_id = detection_data.get('id', 'Unknown')
        
        logger.info(f"Detections: {detections}")
        logger.info(f"Alert: {alert}")
        
        # Find drone detection - check both 'name' and 'label' fields
        drone_detection = None
        for det in detections:
            det_name = det.get('name', det.get('label', '')).lower()
            logger.info(f"Checking detection: {det_name}")
            if det_name == 'drone':
                drone_detection = det
                logger.info(f"Found drone detection: {drone_detection}")
                break
        
        if not drone_detection:
            logger.info("No drone detected in detections list, skipping email alert")
            return False
        
        # Check if this is a red alert
        is_red_alert = alert.get('is_red_alert', False)
        logger.info(f"Is red alert: {is_red_alert}")
        
        if not is_red_alert:
            logger.info("Not a red alert (confidence < 85%), skipping email")
            return False
        
        # Prepare email context
        confidence = drone_detection.get('confidence', 0) * 100
        threat_level = "CRITICAL" if is_red_alert else "MODERATE"
        
        location_address = location.get('address', 'Location not available')
        coordinates = location.get('coordinates', {})
        lat = coordinates.get('lat') if coordinates else None
        lon = coordinates.get('lon') if coordinates else None
        
        timestamp = detection_data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'))
        
        # Email subject
        subject = f"🚨 DRONE ALERT - {threat_level} Threat Detected (Confidence: {confidence:.1f}%)"
        
        # Prepare detections with formatted confidence
        formatted_detections = []
        for det in detections:
            formatted_detections.append({
                'name': det.get('name', det.get('label', 'Unknown')),
                'confidence': det.get('confidence', 0),
                'confidence_percent': f"{det.get('confidence', 0) * 100:.1f}",
            })
        
        # Create simple plain text email
        plain_message = f"""
🚨 DRONE DETECTION ALERT 🚨

Detection ID: {detection_id}
Timestamp: {timestamp}
Threat Level: {threat_level}
Confidence: {confidence:.1f}%

Location: {location_address}
{"Coordinates: " + str(lat) + ", " + str(lon) if lat and lon else ""}

All Detections:
{chr(10).join([f"- {d['name']}: {d['confidence_percent']}%" for d in formatted_detections])}

This is an automated alert from DroneDetect system.
        """
        
        # Create email
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER,
            to=[recipient_email],
        )
        
        # Send email
        email.send(fail_silently=False)
        logger.info(f"✅ Drone alert email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to send drone alert email: {str(e)}", exc_info=True)
        return False
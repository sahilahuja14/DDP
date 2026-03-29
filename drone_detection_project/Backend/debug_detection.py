"""
Debug script to test drone detection and email workflow
"""
import os
import sys
import django
import ssl

# Fix SSL first
ssl._create_default_https_context = ssl._create_unverified_context

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drone_backend.settings')
django.setup()

from datetime import datetime

def test_detection_email():
    """Test the email sending with simulated detection data"""
    
    print("=" * 60)
    print("DroneDetect Email Alert Test - Simulated Detection")
    print("=" * 60)
    print()
    
    # Import after Django setup
    from detections.email_service import send_drone_alert_email
    
    # Simulate detection data that matches what YOLO service returns
    detection_data = {
        'id': 'TEST-12345',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
        'detections': [
            {
                'name': 'drone',  # Using 'name' field (already formatted)
                'confidence': 0.92,  # 92% confidence (above 85% threshold)
            }
        ],
        'alert': {
            'is_red_alert': True,  # This triggers the email
            'threshold': 0.85,
            'drone_max_confidence': 0.92,
            'max_confidence': 0.92
        },
        'location': {
            'address': 'Test Location, New Delhi, India',
            'coordinates': {
                'lat': 28.6139,
                'lon': 77.2090
            }
        }
    }
    
    print("📋 Test Detection Data:")
    print(f"   Detection ID: {detection_data['id']}")
    print(f"   Timestamp: {detection_data['timestamp']}")
    print(f"   Drone Confidence: {detection_data['detections'][0]['confidence']*100:.1f}%")
    print(f"   Is Red Alert: {detection_data['alert']['is_red_alert']}")
    print(f"   Location: {detection_data['location']['address']}")
    print()
    
    print("📤 Attempting to send email alert...")
    print()
    
    try:
        result = send_drone_alert_email(detection_data)
        
        if result:
            print("✅ SUCCESS! Email sent successfully!")
            print()
            print("If you don't receive the email:")
            print("   1. Check your spam/junk folder")
            print("   2. Check the recipient email in .env: ALERT_EMAIL_RECIPIENT")
            print("   3. Look at the logs above for any errors")
        else:
            print("⚠️  Email function returned False")
            print("   Check the logs above for the reason")
        
        return result
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("Testing drone detection email workflow...")
    print()
    success = test_detection_email()
    sys.exit(0 if success else 1)
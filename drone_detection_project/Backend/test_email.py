"""
Simple email test script for DroneDetect
Run this to verify your email configuration is working.
"""
import os
import sys
import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def test_email_direct():
    """Test email sending using direct SMTP (bypassing Django)"""
    print("=" * 50)
    print("DroneDetect Email Configuration Test")
    print("=" * 50)
    print()
    
    # Get configuration
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
    ALERT_EMAIL_RECIPIENT = os.getenv('ALERT_EMAIL_RECIPIENT')
    
    # Check configuration
    print("📧 Email Configuration:")
    print(f"   Host: {EMAIL_HOST}")
    print(f"   Port: {EMAIL_PORT}")
    print(f"   From: {EMAIL_HOST_USER or 'NOT SET'}")
    print(f"   To: {ALERT_EMAIL_RECIPIENT}")
    print()
    
    if not EMAIL_HOST_USER:
        print("❌ ERROR: EMAIL_HOST_USER is not configured!")
        return False
    
    if not EMAIL_HOST_PASSWORD:
        print("❌ ERROR: EMAIL_HOST_PASSWORD is not configured!")
        return False
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = EMAIL_HOST_USER
    msg['To'] = ALERT_EMAIL_RECIPIENT
    msg['Subject'] = '✅ DroneDetect Email Test - Configuration Successful'
    
    body = f'''
This is a test email from DroneDetect.

If you receive this email, your email configuration is working correctly!

Your system is now ready to send drone detection alerts to:
{ALERT_EMAIL_RECIPIENT}

When a drone is detected, you will automatically receive an alert email with:
- Detection details
- Confidence level
- Location information
- GPS coordinates
- Timestamp

Best regards,
DroneDetect System
    '''
    
    msg.attach(MIMEText(body, 'plain'))
    
    # Try to send test email
    print("📤 Sending test email...")
    try:
        # Create SSL context that doesn't verify certificates
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        # Connect to server
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        
        # Login and send
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print()
        print("✅ SUCCESS! Test email sent successfully!")
        print(f"   Please check your inbox at: {ALERT_EMAIL_RECIPIENT}")
        print("   (Also check spam/junk folder if not in inbox)")
        print()
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print()
        print("❌ ERROR: Authentication failed")
        print(f"   Error: {str(e)}")
        print()
        print("🔧 This means your username/password is incorrect:")
        print("   1. For Gmail, you MUST use an App Password, not your regular password")
        print("   2. Go to: https://myaccount.google.com/apppasswords")
        print("   3. Generate a new App Password")
        print("   4. Update EMAIL_HOST_PASSWORD in your .env file")
        print()
        return False
        
    except Exception as e:
        print()
        print("❌ ERROR: Failed to send email")
        print(f"   Error: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        print()
        print("🔧 Troubleshooting:")
        print("   1. Check your internet connection")
        print("   2. Verify firewall allows SMTP connections on port 587")
        print("   3. Try removing spaces from your App Password in .env")
        print("   4. Make sure .env file is in the same directory as this script")
        print()
        return False

if __name__ == '__main__':
    success = test_email_direct()
    sys.exit(0 if success else 1)
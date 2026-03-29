# Email Alert Setup Guide

## Quick Setup

The email alert system is now integrated! When a drone is detected, an email will automatically be sent to **sahilahuja194@gmail.com**.

## Configuration

### Option 1: Environment Variables (Recommended)

Create a `.env` file in the `Backend` directory or set environment variables:

```bash
# Gmail SMTP Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
ALERT_EMAIL_RECIPIENT=sahilahuja194@gmail.com
```

### Option 2: Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to "App passwords" 
4. Generate a new app password for "Mail"
5. Use this password as `EMAIL_HOST_PASSWORD`

### Option 3: Other Email Providers

**Outlook/Hotmail:**
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

**Yahoo:**
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

## Testing

1. Upload an image with a drone or start live monitoring
2. When a drone is detected, check your email (sahilahuja194@gmail.com)
3. The email will include:
   - Detection details
   - Confidence level
   - Location information
   - GPS coordinates (if available)
   - Timestamp

## Email Template

The email uses a professional HTML template located at:
`Backend/detections/templates/detections/email_alert_template.html`

You can customize this template to match your branding.

## Troubleshooting

If emails aren't sending:

1. **Check Django logs** - Look for email errors in the console
2. **Verify credentials** - Make sure EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are correct
3. **Check spam folder** - Emails might be filtered
4. **Test SMTP connection** - Use Django shell:
   ```python
   from django.core.mail import send_mail
   send_mail('Test', 'Test message', 'from@example.com', ['sahilahuja194@gmail.com'])
   ```

## Current Configuration

- **Recipient**: sahilahuja194@gmail.com (hardcoded in settings)
- **Trigger**: Automatically sends when drone is detected
- **Format**: HTML email with detection details

# Complete Email Setup Guide for Drone Detection Alerts

This guide will walk you through setting up email alerts so you receive notifications at **sahilahuja194@gmail.com** when a drone is detected.

## 📧 Quick Overview

The system is already configured to send emails to **sahilahuja194@gmail.com**. You just need to configure your email provider credentials.

---

## 🚀 Step-by-Step Setup

### Method 1: Gmail Setup (Recommended)

#### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with your Google account
3. Under "Signing in to Google", find "2-Step Verification"
4. Click it and follow the prompts to enable it

#### Step 2: Generate App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click "App passwords"
3. You may need to sign in again
4. Select "Mail" as the app
5. Select "Other (Custom name)" as the device
6. Type "DroneDetect" and click "Generate"
7. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

#### Step 3: Configure Django Settings

**Option A: Using Environment Variables (Recommended)**

Create a file named `.env` in the `Backend` folder:

```bash
# Navigate to Backend folder
cd Backend

# Create .env file (Windows PowerShell)
New-Item -Path .env -ItemType File

# Or create manually: Backend/.env
```

Add these lines to the `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
DEFAULT_FROM_EMAIL=your-email@gmail.com
ALERT_EMAIL_RECIPIENT=sahilahuja194@gmail.com
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `abcd efgh ijkl mnop` with the app password you generated (remove spaces)

**Option B: Direct Settings File (Less Secure)**

Edit `Backend/drone_backend/settings.py` and replace:

```python
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'your-email@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'your-app-password-here')
```

⚠️ **Warning:** Don't commit passwords to git! Use environment variables instead.

#### Step 4: Install python-dotenv (for .env file support)

```bash
cd Backend
pip install python-dotenv
```

Then update `Backend/drone_backend/settings.py` at the top:

```python
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
```

#### Step 5: Test Email Configuration

Create a test file `Backend/test_email.py`:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drone_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

try:
    send_mail(
        subject='Test Email from DroneDetect',
        message='This is a test email. If you receive this, your email is configured correctly!',
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=['sahilahuja194@gmail.com'],
        fail_silently=False,
    )
    print("✅ Email sent successfully! Check sahilahuja194@gmail.com")
except Exception as e:
    print(f"❌ Error sending email: {e}")
```

Run the test:

```bash
cd Backend
python test_email.py
```

---

### Method 2: Outlook/Hotmail Setup

#### Step 1: Enable App Password
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Sign in
3. Go to "Security" → "Advanced security options"
4. Under "App passwords", click "Create a new app password"
5. Name it "DroneDetect" and copy the password

#### Step 2: Configure Settings

In your `.env` file or `settings.py`:

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@outlook.com
ALERT_EMAIL_RECIPIENT=sahilahuja194@gmail.com
```

---

### Method 3: Yahoo Mail Setup

#### Step 1: Enable App Password
1. Go to [Yahoo Account Security](https://login.yahoo.com/account/security)
2. Enable "Generate app password"
3. Create app password for "DroneDetect"

#### Step 2: Configure Settings

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@yahoo.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@yahoo.com
ALERT_EMAIL_RECIPIENT=sahilahuja194@gmail.com
```

---

## 🔧 Alternative: Using SMTP Service (SendGrid, Mailgun, etc.)

### SendGrid Example

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key
3. Configure:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=your-verified-email@domain.com
ALERT_EMAIL_RECIPIENT=sahilahuja194@gmail.com
```

---

## ✅ Verification Checklist

- [ ] Email credentials configured in `.env` or `settings.py`
- [ ] App password generated (for Gmail/Outlook)
- [ ] `python-dotenv` installed (if using .env file)
- [ ] Test email sent successfully
- [ ] Email received at sahilahuja194@gmail.com

---

## 🧪 Testing the Full System

1. **Start the backend:**
   ```bash
   cd Backend
   python manage.py runserver
   ```

2. **Upload an image with a drone** or **start live monitoring**

3. **When a drone is detected:**
   - Check the backend console for email sending logs
   - Check your inbox at **sahilahuja194@gmail.com**
   - Check spam folder if not in inbox

---

## 📧 Email Template Preview

The email you'll receive includes:
- 🚨 Alert header with threat level (CRITICAL/MODERATE)
- Detection ID and timestamp
- Confidence percentage
- Location address and GPS coordinates
- List of all detected objects
- Action required notice

---

## 🐛 Troubleshooting

### Issue: "Authentication failed"
- **Solution:** Make sure you're using an App Password, not your regular password
- For Gmail: App passwords are required if 2FA is enabled

### Issue: "Connection refused"
- **Solution:** Check firewall settings, ensure port 587 is open
- Try port 465 with `EMAIL_USE_SSL=True` instead of TLS

### Issue: "Email not received"
- **Solution:** 
  - Check spam/junk folder
  - Verify recipient email is correct: `sahilahuja194@gmail.com`
  - Check backend logs for errors
  - Test with the test script first

### Issue: "Module not found: dotenv"
- **Solution:** 
  ```bash
  pip install python-dotenv
  ```

### Issue: "SMTP server not responding"
- **Solution:** 
  - Verify EMAIL_HOST is correct for your provider
  - Check internet connection
  - Some networks block SMTP ports

---

## 🔒 Security Best Practices

1. **Never commit `.env` file to git**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Use App Passwords**
   - Don't use your main account password
   - App passwords can be revoked easily

3. **Rotate passwords regularly**
   - Update app passwords every 90 days

4. **Use separate email for alerts**
   - Consider creating a dedicated email for system alerts

---

## 📝 Current Configuration

The system is pre-configured with:
- **Recipient:** sahilahuja194@gmail.com
- **Trigger:** Automatic when drone detected
- **Format:** HTML email with full detection details
- **Template:** `Backend/detections/templates/detections/email_alert_template.html`

---

## 🎯 Quick Start (Gmail - 5 minutes)

1. Enable 2FA on Gmail
2. Generate App Password
3. Create `Backend/.env` file:
   ```env
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-16-char-app-password
   ```
4. Install dotenv: `pip install python-dotenv`
5. Add to settings.py: `from dotenv import load_dotenv` and `load_dotenv()`
6. Test: Run `python test_email.py`
7. Done! 🎉

---

## 📞 Need Help?

If you encounter issues:
1. Check backend console logs
2. Run the test email script
3. Verify all credentials are correct
4. Ensure firewall allows SMTP connections

The email system will automatically send alerts whenever a drone is detected during live monitoring or image upload!

# 🚀 Quick Email Setup (5 Minutes)

## Step 1: Install python-dotenv

```bash
cd Backend
pip install python-dotenv
```

## Step 2: Create .env File

Create a file named `.env` in the `Backend` folder with this content:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=your-email@gmail.com
ALERT_EMAIL_RECIPIENT=sahilahuja194@gmail.com
```

## Step 3: Get Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not already enabled)
3. Go to "App passwords": https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Type "DroneDetect" and click Generate
6. Copy the 16-character password (remove spaces)
7. Paste it as `EMAIL_HOST_PASSWORD` in your `.env` file

## Step 4: Test It

```bash
cd Backend
python test_email.py
```

If successful, you'll see: ✅ SUCCESS! Check your email at sahilahuja194@gmail.com

## Step 5: Done! 🎉

Now when a drone is detected, you'll automatically receive an email alert!

---

## 📧 Email Already Configured

- **Recipient:** sahilahuja194@gmail.com ✅
- **Template:** Professional HTML email ✅
- **Auto-send:** When drone detected ✅

You just need to add your email credentials!

---

## ❓ Troubleshooting

**"Authentication failed"**
→ Use App Password, not regular password

**"Module not found: dotenv"**
→ Run: `pip install python-dotenv`

**Email not received?**
→ Check spam folder
→ Verify recipient: sahilahuja194@gmail.com

For detailed guide, see: `EMAIL_SETUP_GUIDE.md`

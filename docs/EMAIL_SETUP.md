# Email Notifications Setup Guide

## Overview
The ticketing system sends email notifications for:
- ✅ New ticket creation (to ticket creator)
- ✅ Ticket status updates (to ticket owner)
- ✅ Ticket assignments (to assigned user)

## Email Configuration

### Step 1: Configure Email Settings in Admin Panel

1. Login as an **Admin** user
2. Go to **Settings** page
3. Scroll to **Email Configuration** section
4. Fill in the following:

   - **SMTP Host**: Your mail server (e.g., `smtp.gmail.com`)
   - **SMTP Port**: Usually `587` for TLS or `465` for SSL
   - **Secure Connection**: Check for SSL/TLS (Port 465)
   - **SMTP Username**: Your email address
   - **SMTP Password**: Your email password or app-specific password
   - **From Email Address**: Email to send from (e.g., `noreply@yourdomain.com`)
   - **From Name**: Display name (e.g., `Ticketing System`)

5. Click **Save Settings**
6. Use **Send Test Email** to verify configuration

### Step 2: Common Email Providers

#### Gmail Configuration
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Secure: No (uses TLS)
Username: your-email@gmail.com
Password: Your App Password (see below)
```

**Important for Gmail:**
- You MUST use an **App Password**, not your regular Gmail password
- Enable 2-Factor Authentication on your Google account
- Generate an App Password: https://myaccount.google.com/apppasswords
- Use the 16-character app password in the settings

#### Outlook/Office365 Configuration
```
SMTP Host: smtp.office365.com
SMTP Port: 587
Secure: No (uses TLS)
Username: your-email@outlook.com
Password: Your Outlook password
```

#### Custom SMTP Server
```
SMTP Host: mail.yourdomain.com
SMTP Port: 587 or 465
Secure: Check if using port 465
Username: your-email@yourdomain.com
Password: Your email password
```

### Step 3: Environment Variables (Alternative Method)

If you prefer to configure email via environment variables:

**Backend `.env` file:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**Note:** Database settings (via Admin panel) take precedence over environment variables.

## Troubleshooting

### Issue: "Email credentials not configured"

**Solution:**
- Check backend server logs for this warning
- Ensure SMTP Username and Password are filled in Settings
- Try the **Send Test Email** feature

### Issue: "Authentication failed"

**Possible causes:**
1. **Wrong password** - Double-check your credentials
2. **Gmail without App Password** - You must use an App Password for Gmail
3. **2FA not enabled** - Gmail requires 2FA to generate App Passwords
4. **Less secure app access** - Some providers block "less secure apps"

**Solutions:**
- For Gmail: Use App Password (16 characters, no spaces)
- For other providers: Enable "less secure app access" in your email settings
- Verify username is your full email address

### Issue: Emails not being sent

**Check these:**

1. **Server logs** - Look for email-related errors:
   ```bash
   # If running locally:
   cd backend
   npm run dev
   
   # Look for messages like:
   # ✉️  Email transporter initialized
   # ✉️  Email sent successfully to user@example.com
   # ❌ Email notification failed: [error details]
   ```

2. **Email settings saved** - Verify settings were saved in the database:
   - Go to Settings page
   - Check if values are populated
   - Click Save Settings again

3. **Test Email feature** - Use the test email button to verify configuration

4. **Check spam folder** - Emails might be marked as spam

5. **Firewall/Network** - Ensure your server can make outbound SMTP connections

### Issue: Port connection errors

**Error messages like:**
- "Connection timeout"
- "ECONNREFUSED"
- "Port not accessible"

**Solutions:**
1. Try different ports:
   - Port 587 with TLS (most common)
   - Port 465 with SSL
   - Port 25 (often blocked by ISPs)

2. Check firewall rules:
   - Ensure outbound connections on SMTP ports are allowed
   - Contact your hosting provider if using cloud hosting

3. For DigitalOcean App Platform:
   - Use port 587 (recommended)
   - Ensure your email provider allows connections from DigitalOcean IPs

## Verification

### Test Email Notifications End-to-End

1. **Configure email** in Settings page
2. **Send test email** - Should receive immediately
3. **Create a new ticket** - Creator should get "Request Created" email
4. **Update ticket status** - Owner should get "Status Updated" email
5. **Assign ticket** - Assigned user should get "Assigned" email

### Check Server Logs

Look for these success messages:
```
✉️  Email transporter initialized
✉️  Email sent successfully to user@example.com
```

Look for these error messages:
```
❌ Email notification failed: [error details]
⚠️  Email credentials not configured. Email notifications disabled.
```

## Email Templates

The system sends beautifully formatted HTML emails with:
- Company branding
- Request details (number, subject, status, priority)
- Professional styling
- Dark mode friendly colors

## Notification Settings

Control which events trigger emails in the **Settings** page under **Notification Preferences**:
- Notify on request created
- Notify on request updated
- Notify on request assigned
- Notify on comment added

## Security Best Practices

1. **Use App Passwords** for Gmail/Google Workspace
2. **Never commit** email credentials to git
3. **Use environment variables** in production
4. **Enable 2FA** on your email account
5. **Use dedicated email** for notifications (e.g., noreply@domain.com)
6. **Monitor email logs** for suspicious activity

## Production Deployment

For production on DigitalOcean:

1. Set environment variables in App Platform:
   - Go to your app → Settings → App-Level Environment Variables
   - Add `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`

2. Or configure via Admin Settings panel (recommended)

3. Test thoroughly before going live

## Need Help?

If emails still aren't working:

1. Check backend server logs for detailed error messages
2. Verify email credentials are correct
3. Test with the "Send Test Email" feature
4. Try a different email provider temporarily
5. Check your email provider's SMTP documentation
6. Ensure no firewall is blocking SMTP ports

---

**Email notifications are now fully configured! 🎉**


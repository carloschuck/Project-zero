# Email Notification Preferences - Testing Guide

## Overview

All email notification preferences in the Settings page are now **fully functional** and respect the toggle states. When a preference is disabled, no email will be sent for that event.

## ✅ Implemented Notification Types

### User Notifications

| Preference | When Triggered | Recipient | Database Setting |
|------------|---------------|-----------|------------------|
| **Request Created** | User creates a new request | Request creator | `notify_on_request_created` |
| **Status Updated** | Admin/staff changes request status | Request owner | `notify_user_on_status_change` |
| **Request Assigned** | Admin/staff assigns request to someone | Assigned person | `notify_on_request_assigned` |
| **New Comment** | Someone comments on a request | Request owner | `notify_on_request_commented` |

### Admin Notifications

| Preference | When Triggered | Recipient | Database Setting |
|------------|---------------|-----------|------------------|
| **New Request** | Any user creates a new request | All admins & department leads | `notify_admin_on_new_request` |

## 🔧 How It Works

### 1. Notification Preference Check
Before sending any email, the system checks the database:

```javascript
isNotificationEnabled('notify_on_request_created') // Returns true/false
```

If the preference is **disabled** (toggle OFF), the email is skipped:
```
⏭️  Email notification skipped for created - preference disabled
```

### 2. Email Templates

Each notification type has a beautifully formatted HTML email template:

- **Request Created** - Blue header, request details
- **Status Updated** - Blue header, status change notification
- **Request Assigned** - Blue header, assignment details
- **New Comment** - Blue header, comment preview
- **Admin New Request** - Red header (urgent), full request details

## 🧪 Testing Each Notification Type

### Setup
1. Configure email settings in Settings page (SMTP credentials)
2. Ensure all notification preferences are **enabled** (toggle ON)
3. Have a test email address ready

---

### Test 1: Request Created
**Scenario:** User creates a new ticket

**Steps:**
1. Login as a regular user
2. Go to "Create Request"
3. Fill out the form and submit

**Expected Result:**
✉️ User receives: "Request Created: [TICKET-NUMBER]"
- Contains request number, subject, status, priority

**To disable:**
- Settings → User Notifications → Turn OFF "Request Created"

---

### Test 2: Status Updated
**Scenario:** Admin changes ticket status

**Steps:**
1. Create a ticket as User A
2. Login as Admin
3. Go to the ticket detail page
4. Change status (e.g., Open → In Progress)

**Expected Result:**
✉️ User A receives: "Request Updated: [TICKET-NUMBER]"
- Shows new status

**To disable:**
- Settings → User Notifications → Turn OFF "Status Updated"

---

### Test 3: Request Assigned
**Scenario:** Admin assigns ticket to staff member

**Steps:**
1. Create a ticket
2. Login as Admin
3. Go to ticket detail page
4. Assign to a staff member (User B)

**Expected Result:**
✉️ User B receives: "Request Assigned: [TICKET-NUMBER]"
- Contains request details and description

**To disable:**
- Settings → User Notifications → Turn OFF "Request Assigned"

---

### Test 4: New Comment
**Scenario:** Someone comments on a ticket

**Steps:**
1. User A creates a ticket
2. Login as Admin or different user
3. Go to ticket detail page
4. Add a comment

**Expected Result:**
✉️ User A receives: "New Comment on Request: [TICKET-NUMBER]"
- Shows commenter name and comment text

**Important:** 
- Only sends if commenter is NOT the ticket owner
- Does NOT send for internal comments (staff-only)

**To disable:**
- Settings → User Notifications → Turn OFF "New Comment"

---

### Test 5: Admin New Request Notification
**Scenario:** User creates a new ticket

**Steps:**
1. Login as a regular user
2. Create a new request

**Expected Result:**
✉️ All admins & department leads receive: "New Request Submitted: [TICKET-NUMBER]"
- Red urgent header
- Shows creator name, category, priority, description

**To disable:**
- Settings → Admin Notifications → Turn OFF "New Request"

---

## 🎯 Complete Test Scenario

### Full Workflow Test

1. **Enable all notifications** in Settings
2. **Create test users:**
   - User (john@example.com)
   - Admin (admin@example.com)
   - Staff (staff@example.com)

3. **Test sequence:**
   ```
   Action                           | Who gets email?
   --------------------------------|----------------------------------
   1. John creates ticket          | ✉️ John (created)
                                   | ✉️ Admin (admin notification)
   --------------------------------|----------------------------------
   2. Admin assigns to Staff       | ✉️ Staff (assigned)
   --------------------------------|----------------------------------
   3. Staff changes status         | ✉️ John (status updated)
   --------------------------------|----------------------------------
   4. Admin adds comment           | ✉️ John (new comment)
   --------------------------------|----------------------------------
   5. John adds comment            | ❌ No email (owner commenting)
   ```

4. **Check spam folders** if emails don't arrive

5. **Check server logs** for confirmation:
   ```
   ✉️  Email sent successfully to john@example.com
   ✉️  Email sent successfully to admin@example.com
   ```

---

## 🔄 Toggle Testing

### Test Preference Disabling

1. **Disable "Request Created"**
   - User creates ticket
   - ❌ User receives NO email
   - ✅ Admin still receives admin notification

2. **Disable "Admin New Request"**
   - User creates ticket
   - ✅ User receives created email
   - ❌ Admin receives NO email

3. **Disable "Status Updated"**
   - Admin changes status
   - ❌ User receives NO email

4. **Disable all notifications**
   - Perform all actions
   - ❌ NO emails sent at all
   - ✅ In-app notifications still work

---

## 📊 Verification Checklist

After testing, verify:

- [ ] Request Created emails work when enabled
- [ ] Request Created emails stop when disabled
- [ ] Status Updated emails work when enabled
- [ ] Status Updated emails stop when disabled
- [ ] Request Assigned emails work when enabled
- [ ] Request Assigned emails stop when disabled
- [ ] New Comment emails work when enabled
- [ ] New Comment emails stop when disabled
- [ ] Admin New Request emails work when enabled
- [ ] Admin New Request emails stop when disabled
- [ ] Internal comments don't trigger emails
- [ ] Email templates look professional
- [ ] All emails contain correct information

---

## 🐛 Troubleshooting

### Issue: Emails not being sent even when enabled

**Check:**
1. SMTP settings configured correctly
2. Use "Send Test Email" feature
3. Check server logs for errors
4. Verify notification toggle is ON (blue)
5. Check spam folder

**Server logs to look for:**
```bash
✉️  Email sent successfully to user@example.com          # Success
⏭️  Email notification skipped for created - preference disabled  # Preference OFF
⚠️  Email credentials not configured                     # Need SMTP setup
❌  Email notification failed: [error]                    # Error occurred
```

### Issue: Getting duplicate emails

**Possible causes:**
- Server running multiple instances
- Browser submitting form twice
- Check server logs for multiple send attempts

### Issue: Notification toggle not saving

**Solution:**
1. Ensure you click "Save Settings" button
2. Check browser console for errors
3. Verify database connection
4. Check that `system_settings` table exists

---

## 🔐 Security Notes

- Notification preferences are system-wide (affect all users)
- Only admins can change notification preferences
- Email content is sanitized to prevent XSS
- SMTP credentials are encrypted in database
- Internal comments never trigger external emails

---

## 📝 Database Settings Reference

All notification preferences are stored in `system_settings` table:

```sql
SELECT setting_key, setting_value 
FROM system_settings 
WHERE setting_key LIKE 'notify_%';
```

Expected results:
```
notify_on_request_created      | true
notify_on_request_updated      | true  (deprecated, uses notify_user_on_status_change)
notify_on_request_assigned     | true
notify_on_request_commented    | true
notify_admin_on_new_request    | true
notify_user_on_status_change   | true
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ All toggles save correctly
2. ✅ Emails arrive within seconds of events
3. ✅ Disabling toggles stops emails
4. ✅ Enabling toggles resumes emails
5. ✅ Server logs show successful sends
6. ✅ Email templates look professional
7. ✅ No errors in server logs
8. ✅ Test email feature works

---

**Email notifications are now fully implemented and respect all preference settings! 🎊**


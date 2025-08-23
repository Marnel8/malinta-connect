# Push Notification System Testing Guide

## Overview

This guide will help you test the Firebase Cloud Messaging (FCM) push notification system that has been implemented for your barangay management application.

## Prerequisites

1. ✅ Firebase project configured with FCM
2. ✅ VAPID key configured
3. ✅ Service worker (`firebase-messaging-sw.js`) in place
4. ✅ Server actions for notifications implemented
5. ✅ Enhanced permission handling added

## Step-by-Step Testing

### 1. Enable Notifications in Browser

1. **Visit the home page** (`/`) while logged in as a resident
2. **Look for the notification permission card** below the hero section
3. **Click "Enable Notifications"** if the status shows "⏳ Not Set"
4. **Allow notifications** when the browser prompts you
5. **Verify the status changes** to "✅ Enabled"

### 2. Check FCM Token Registration

1. **Open browser console** (F12 → Console)
2. **Look for these log messages:**
   ```
   Current notification permission: granted
   Getting FCM token...
   FCM token retrieved successfully
   FCM token stored successfully
   ```
3. **If you see "No FCM tokens found for notification"** - this means no users have registered tokens yet

### 3. Test Admin Dashboard Notifications

1. **Log in as an admin** and go to `/admin`
2. **Look for the blue notification card** at the top
3. **Enable notifications** if not already enabled
4. **Use the FCM Debug component** at the bottom of the dashboard:
   - Click "Check FCM Tokens" to see registered tokens
   - Click "Send Test Notification" to send a test notification

### 4. Test Real Notifications

1. **Create a new certificate request** as a resident
2. **Log in as admin** and update the certificate status
3. **Check if the resident receives a notification** about the status update
4. **Test other notification types:**
   - Create an announcement (notifies all residents)
   - Create an event (notifies all residents)
   - Update an appointment status (notifies specific resident)
   - Update a blotter case status (notifies specific resident)

### 5. Debug Common Issues

#### Issue: "No FCM tokens found for notification"

**Cause:** Users haven't visited the home page while logged in and allowed notifications
**Solution:**

- Have users visit `/` while logged in
- Ensure they allow notifications when prompted
- Check browser console for FCM token logs

#### Issue: "Invalid JSON payload received. Unknown name 'badge'"

**Cause:** FCM doesn't support the `badge` field in notification payloads
**Solution:** ✅ **FIXED** - Removed all `badge` references from notification data

#### Issue: Service worker registration failed

**Cause:** Missing or malformed `firebase-messaging-sw.js`
**Solution:** ✅ **FIXED** - Service worker properly configured with error handling

#### Issue: Notifications not showing

**Cause:** Browser permission denied or service worker not active
**Solution:**

- Check browser notification permissions
- Ensure service worker is registered
- Check browser console for errors

## Testing Checklist

### ✅ Basic Setup

- [ ] Service worker loads without errors
- [ ] FCM token is generated and stored
- [ ] Notification permission is granted
- [ ] Token is stored in Firebase database

### ✅ Notification Sending

- [ ] Test notification can be sent from admin dashboard
- [ ] Real notifications are triggered for:
  - [ ] Certificate status updates
  - [ ] Appointment status updates
  - [ ] New announcements
  - [ ] New events
  - [ ] Blotter case updates
  - [ ] Resident verification status

### ✅ User Experience

- [ ] Residents see notification permission card on home page
- [ ] Admins see notification permission card on dashboard
- [ ] Permission status is clearly displayed
- [ ] Users can enable notifications with one click
- [ ] Clear guidance for denied permissions

### ✅ Debug Tools

- [ ] FCM Debug component shows token information
- [ ] Permission status is displayed
- [ ] Test notifications can be sent
- [ ] Token storage can be verified

## Troubleshooting Commands

### Check FCM Tokens in Database

```bash
# In Firebase Console → Realtime Database
# Look for: fcmTokens and fcmTokensByRole nodes
```

### Check Service Worker

```bash
# In Browser DevTools → Application → Service Workers
# Should see: firebase-messaging-sw.js active
```

### Check Console Logs

```bash
# Look for these key messages:
# "FCM token retrieved successfully"
# "FCM token stored successfully"
# "Notification sent successfully: X success, Y failure"
```

## Expected Results

### Successful Setup

- Users can enable notifications with one click
- FCM tokens are automatically stored when visiting home page
- Admins receive notifications for new requests
- Residents receive notifications for status updates
- Test notifications work from admin dashboard

### Common Success Indicators

- Console shows "FCM token stored successfully"
- FCM Debug component shows registered tokens
- Test notifications appear on screen
- Real notifications are triggered by actions

## Next Steps After Testing

1. **Monitor notification delivery rates** in Firebase Console
2. **Test on different browsers** (Chrome, Firefox, Safari)
3. **Test on mobile devices** if applicable
4. **Set up notification analytics** to track engagement
5. **Customize notification content** based on user feedback

## Support

If you encounter issues:

1. Check browser console for error messages
2. Verify Firebase configuration
3. Check notification permissions in browser
4. Use the FCM Debug component to diagnose issues
5. Review this guide for common solutions

---

**Last Updated:** January 2025  
**Status:** ✅ All major issues resolved, system ready for testing

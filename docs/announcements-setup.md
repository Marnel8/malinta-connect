# Announcements Setup

This document explains how the announcements system works and how to set it up in your Malinta Connect application.

## Overview

The announcements system allows administrators to create and manage public announcements that are displayed to residents on the events page. All announcements are stored in Firebase Realtime Database and follow the server-actions pattern for security.

## Features

- **Public Announcements**: Displayed to all residents
- **Category System**: Important, Notice, Event, Emergency
- **Status Management**: Draft, Published, Expired
- **Visibility Control**: Public or Residents-only
- **Automatic Expiration**: Announcements can have expiration dates
- **Real-time Updates**: Changes reflect immediately in the UI

## Database Structure

Announcements are stored in the `announcements` node with the following structure:

```json
{
  "announcements": {
    "uniqueId": {
      "title": "Announcement Title",
      "description": "Detailed description...",
      "category": "Important|Notice|Event|Emergency",
      "status": "draft|published|expired",
      "visibility": "public|residents",
      "author": "Author Name",
      "publishedOn": "2025-04-25",
      "expiresOn": "2025-05-10",
      "createdAt": 1640995200000,
      "updatedAt": 1640995200000
    }
  }
}
```

## Server Actions

### `getPublicAnnouncementsAction()`
- **Purpose**: Fetches only published, public announcements for client-side display
- **Usage**: Used in the events page to display announcements to residents
- **Security**: Only returns announcements with `status: "published"` and `visibility: "public"`

### `getAllAnnouncementsAction()`
- **Purpose**: Fetches all announcements for admin management
- **Usage**: Used in admin panels for full announcement management
- **Security**: Admin-only access through Firebase Admin SDK

### `createAnnouncementAction()`
- **Purpose**: Creates new announcements
- **Usage**: Admin creates announcements through admin interface
- **Features**: Auto-generates reference numbers and timestamps

### `updateAnnouncementAction()`
- **Purpose**: Updates existing announcements
- **Usage**: Admin edits announcement details
- **Features**: Automatically updates `updatedAt` timestamp

### `publishAnnouncementAction()` / `unpublishAnnouncementAction()`
- **Purpose**: Controls announcement visibility
- **Usage**: Admin publishes or unpublishes announcements
- **Features**: Automatically sets `publishedOn` date when publishing

## Setup Instructions

### 1. Database Rules

Ensure your Firebase database rules include the announcements node:

```json
{
  "announcements": {
    ".indexOn": ["createdAt", "status", "createdBy"],
    "$announcementId": {
      ".read": "auth != null",
      ".write": "auth != null && (data.child('createdBy').val() == auth.uid || root.child('users').child(auth.uid).child('role').val() == 'admin')"
    }
  }
}
```

### 2. Seed Sample Data

Run the seed script to populate your database with sample announcements:

```bash
cd scripts
node seed-announcements.js
```

### 3. Test the Functionality

1. Navigate to the events page (`/events`)
2. Click on the "Announcements" tab
3. Verify that sample announcements are displayed
4. Check that categories show appropriate badge colors

## Usage

### For Residents

Residents can view announcements by:
1. Going to the Events page
2. Clicking the "Announcements" tab
3. Reading through current announcements
4. Seeing real-time updates when new announcements are published

### For Administrators

Admins can manage announcements through:
1. Admin dashboard (`/admin/announcements`)
2. Create new announcements
3. Edit existing announcements
4. Publish/unpublish announcements
5. Set expiration dates
6. Control visibility settings

## Integration Points

### Events Page
- **File**: `app/(sites)/events/page.tsx`
- **Function**: Displays public announcements to residents
- **Data Source**: `getPublicAnnouncementsAction()`

### Admin Panel
- **File**: `app/admin/announcements/page.tsx`
- **Function**: Full announcement management for administrators
- **Data Source**: `getAllAnnouncementsAction()`

## Security Considerations

1. **Server Actions Only**: All Firebase operations go through server actions
2. **Admin SDK**: Server actions use Firebase Admin SDK for secure access
3. **Visibility Control**: Public announcements are filtered server-side
4. **Authentication**: All operations require proper authentication
5. **Authorization**: Only admins can create/edit announcements

## Troubleshooting

### Common Issues

1. **No announcements displayed**
   - Check if announcements exist in database
   - Verify announcements have `status: "published"`
   - Ensure announcements have `visibility: "public"`

2. **Permission errors**
   - Verify Firebase database rules
   - Check user authentication status
   - Ensure proper admin role assignment

3. **Loading issues**
   - Check Firebase connection
   - Verify server action imports
   - Check browser console for errors

### Debug Steps

1. Check Firebase console for data
2. Verify server action responses
3. Check browser network tab
4. Review Firebase database rules
5. Test with admin account

## Future Enhancements

- **Push Notifications**: Send announcements as push notifications
- **Email Integration**: Email important announcements to residents
- **Scheduled Publishing**: Auto-publish announcements at specific times
- **Rich Media**: Support for images and attachments
- **Translation**: Multi-language announcement support
- **Analytics**: Track announcement readership and engagement

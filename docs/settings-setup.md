# Settings Setup and Usage

This document explains how to set up and use the settings functionality in the Malinta Connect application.

## Overview

The settings system allows administrators to manage various configuration options including:
- Barangay information (name, address, contact details)
- Office hours (weekday and weekend schedules)
- Notification preferences (email, system notifications, SMS notifications - coming soon)
- User role configurations

## Firebase Database Structure

Settings are stored in Firebase Realtime Database under the `settings` node:

```
settings/
├── barangay/
│   ├── barangayName
│   ├── municipality
│   ├── address
│   ├── contact
│   └── email
├── officeHours/
│   ├── weekdays/
│   │   ├── start
│   │   └── end
│   └── weekends/
│       ├── start
│       └── end
├── notifications/
│   ├── emailNotifications
│   ├── smsNotifications
│   └── systemNotifications
└── userRoles/
    ├── superAdmin/
    ├── staff/
    └── resident/
```

## Initial Setup

### 1. Initialize Default Settings

Run the initialization script to create default settings in Firebase:

```bash
pnpm run init:settings
```

This script will:
- Check if settings already exist
- Create default settings if none are found
- Use the configuration from `scripts/initialize-settings.js`

### 2. Verify Database Connection

Ensure your Firebase configuration in `app/firebase/firebase.ts` is correct and the database URL points to your Firebase Realtime Database.

## Server Actions

All Firebase operations are handled through server actions in `app/actions/settings.ts`:

- `getSettings()` - Retrieve all settings
- `updateBarangayInfo(data)` - Update barangay information
- `updateOfficeHours(data)` - Update office hours
- `updateNotificationSettings(data)` - Update notification preferences
- `updateUserRoleSettings(data)` - Update user role configurations
- `updateAllSettings(data)` - Update all settings at once
- `initializeDefaultSettings()` - Initialize default settings if none exist

## Usage

### Accessing Settings

Navigate to `/admin/settings` to access the settings page. The page is organized into tabs:

1. **General** - Barangay information and office hours
2. **Notifications** - Email, SMS, and system notification preferences
3. **User Management** - User role configurations

### Updating Settings

Each section has its own form with individual save buttons. You can also use the "Save All Changes" button at the bottom to save all modifications at once.

**Note**: SMS notifications are currently marked as "Coming Soon" and cannot be modified. This feature is in development and will be available in a future update.

### Form Validation

All forms include:
- Required field validation
- Loading states during submission
- Success/error toast notifications
- Disabled states while saving

## Features

### Loading States
- Initial loading spinner when fetching settings
- Individual form submission loading states
- Disabled buttons during operations

### Toast Notifications
- Success messages for successful updates
- Error messages for failed operations
- Uses the existing toast system

### Real-time Updates
- Settings are immediately reflected in the UI after successful updates
- Database is updated in real-time
- Path revalidation ensures fresh data

## Error Handling

The system includes comprehensive error handling:
- Try-catch blocks around all Firebase operations
- User-friendly error messages
- Graceful fallbacks for failed operations
- Console logging for debugging

## Security

- All Firebase operations are performed through server actions
- Client-side code only handles UI state and form submission
- Database rules should be configured to restrict access to authenticated users only

## Customization

### Adding New Settings

1. Update the TypeScript interfaces in `app/actions/settings.ts`
2. Add the new setting to the `getDefaultSettings()` function
3. Create a new server action for updating the setting
4. Add the UI components to the settings page

### Modifying Default Values

Edit the `defaultSettings` object in `scripts/initialize-settings.js` and run the initialization script again.

## Troubleshooting

### Common Issues

1. **Settings not loading**: Check Firebase connection and database rules
2. **Updates not saving**: Verify server action permissions and database access
3. **Toast notifications not showing**: Ensure Toaster component is properly configured

### Debug Mode

Enable console logging by checking the browser console for error messages and the Firebase console for database operations.

## Dependencies

- Firebase Realtime Database
- Next.js server actions
- React hooks for state management
- Toast notifications system
- UI components from the design system

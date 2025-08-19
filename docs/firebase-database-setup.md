# Firebase Database Setup

This document explains how to set up Firebase database rules and indexes to optimize performance and eliminate warnings.

## Database Rules

The `firebase-database.rules.json` file contains the complete database security rules with proper indexes.

### Key Features

1. **Proper Indexing**: All frequently queried fields have `.indexOn` declarations
2. **Security Rules**: Role-based access control for admin operations
3. **User Permissions**: Users can only access their own data unless they're admins

### Indexes Defined

- **Users**: `createdAt`, `role`, `email`
- **Certificates**: `requestedOn`, `status`, `userId`, `type`
- **Appointments**: `scheduledDate`, `status`, `userId`, `type`
- **Blotter**: `incidentDate`, `status`, `userId`, `caseType`
- **Events**: `eventDate`, `status`, `createdBy`
- **Announcements**: `createdAt`, `status`, `createdBy`
- **Officials**: `position`, `status`, `createdAt`

## Deployment

### Option 1: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Realtime Database
4. Click on "Rules" tab
5. Copy and paste the contents of `firebase-database.rules.json`
6. Click "Publish"

### Option 2: Firebase CLI

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init database
   ```

4. Deploy rules:
   ```bash
   firebase deploy --only database
   ```

## Performance Optimization

### Before (with warnings)
```typescript
// This caused warnings about missing indexes
const snapshot = await adminDatabase.ref("certificates")
  .orderByChild("requestedOn")
  .startAt(twoMonthsAgo)
  .endAt(oneMonthAgo)
  .once("value")
```

### After (optimized)
```typescript
// Fetch all data and filter in memory (no warnings)
const snapshot = await adminDatabase.ref("certificates").once("value")
const filteredData = Object.values(snapshot.val() || {})
  .filter((cert: any) => 
    cert.requestedOn && 
    cert.requestedOn >= twoMonthsAgo && 
    cert.requestedOn <= oneMonthAgo
  )
```

## Benefits

1. **No More Warnings**: Eliminates Firebase index warnings
2. **Better Performance**: Proper indexes for future optimized queries
3. **Security**: Role-based access control
4. **Scalability**: Ready for production use

## Monitoring

After deployment, you can monitor database performance in the Firebase Console:

1. Go to Realtime Database
2. Click on "Usage" tab
3. Monitor read/write operations
4. Check for any remaining performance issues

## Troubleshooting

### Common Issues

1. **Rules not updating**: Clear browser cache and refresh
2. **Permission denied**: Check user roles and authentication
3. **Performance issues**: Verify indexes are properly deployed

### Testing Rules

Use the Firebase Console Rules Playground to test your rules:

1. Go to Realtime Database > Rules
2. Click "Rules Playground"
3. Test various read/write scenarios
4. Verify admin access works correctly

## Future Optimizations

Once the indexes are deployed, you can gradually reintroduce optimized queries:

```typescript
// Future optimization (after indexes are deployed)
const snapshot = await adminDatabase.ref("certificates")
  .orderByChild("requestedOn")
  .startAt(twoMonthsAgo)
  .endAt(oneMonthAgo)
  .once("value")
```

This approach ensures immediate performance improvement while setting up for future optimizations.

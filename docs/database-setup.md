# Database Setup Guide

This guide explains how to set up the Firebase database with admin users and sample data for the Malinta Connect application.

## Prerequisites

1. **Firebase Project**: Ensure you have a Firebase project set up with:

   - Authentication enabled
   - Realtime Database enabled
   - Proper security rules configured

2. **Service Account Key**: Download your Firebase service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-service-account.json` in your project root

## Option 1: Using Firebase Admin SDK (Recommended)

This approach creates actual Firebase Auth users and seeds the database with the correct UIDs.

### 1. Install Dependencies

```bash
npm install firebase-admin
```

### 2. Place Service Account Key

Place your `firebase-service-account.json` file in the project root directory.

### 3. Run the Seeding Script

```bash
node scripts/create-admin-users.js
```

This script will:

- Create Firebase Auth users for admin, official, and resident
- Seed the database with user profiles
- Add sample events and other data
- Provide login credentials

### 4. Login Credentials

After running the script, you can use these credentials:

- **Admin**: `admin@barangay.gov` / `admin123456`
- **Official**: `official@barangay.gov` / `official123456`
- **Resident**: `resident@example.com` / `resident123456`

## Option 2: Manual Database Seeding

If you prefer to create users manually through Firebase Console:

### 1. Create Firebase Auth Users

1. Go to Firebase Console → Authentication → Users
2. Click "Add User" and create:
   - `admin@barangay.gov` with password `admin123456`
   - `official@barangay.gov` with password `official123456`
   - `resident@example.com` with password `resident123456`

### 2. Get User UIDs

1. After creating each user, note their UID
2. Update the `scripts/seed-admin.ts` file with the correct UIDs

### 3. Run TypeScript Seeding Script

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run the seeding script
ts-node scripts/seed-admin.ts
```

## Database Structure

The seeding scripts will create the following structure:

```
users/
├── {admin-uid}/
│   ├── uid: string
│   ├── email: string
│   ├── role: 'admin'
│   ├── firstName: string
│   ├── lastName: string
│   ├── phoneNumber: string
│   ├── address: string
│   ├── position: string
│   ├── permissions: object
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
├── {official-uid}/
│   └── ... (similar structure)
└── {resident-uid}/
    └── ... (similar structure)

events/
├── event-1/
│   ├── id: string
│   ├── title: string
│   ├── description: string
│   ├── date: string
│   ├── time: string
│   ├── location: string
│   ├── type: string
│   ├── status: string
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
└── event-2/
    └── ... (similar structure)

certificates/
└── cert-1/
    ├── id: string
    ├── type: string
    ├── residentId: string
    ├── residentName: string
    ├── purpose: string
    ├── status: string
    ├── requestedAt: timestamp
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

## Security Rules

Ensure your Firebase Realtime Database has proper security rules. Here's a basic example:

```json
{
	"rules": {
		"users": {
			"$uid": {
				".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
				".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
			}
		},
		"events": {
			".read": "auth != null",
			".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'official' || root.child('users').child(auth.uid).child('role').val() === 'admin')"
		},
		"certificates": {
			".read": "auth != null",
			".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'official' || root.child('users').child(auth.uid).child('role').val() === 'admin')"
		}
	}
}
```

## Troubleshooting

### Common Issues

1. **Service Account Key Not Found**

   - Ensure `firebase-service-account.json` is in the project root
   - Check file permissions

2. **Permission Denied**

   - Verify your service account has proper permissions
   - Check database security rules

3. **User Already Exists**
   - The script handles existing users gracefully
   - It will update the database profile for existing users

### Testing the Setup

1. Run the seeding script
2. Try logging in with the provided credentials
3. Check if users are redirected to appropriate pages based on their role
4. Verify admin users can access the admin dashboard

## Next Steps

After setting up the database:

1. Test the login functionality
2. Verify role-based access control
3. Test the admin dashboard
4. Customize user permissions as needed
5. Add more sample data for testing

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify Firebase configuration
3. Ensure all dependencies are installed
4. Check Firebase Console for any authentication or database errors

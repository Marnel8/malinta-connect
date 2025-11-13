# Resident Verification System

## Overview

The resident verification system prevents unverified residents from logging into the application. New residents must be verified by an admin before they can access their accounts.

## How It Works

### 1. Registration Process

- When a new resident registers, their account is created with `verificationStatus: "pending"`
- The verification status is stored in both the `users` collection and `residents` collection
- The resident cannot log in until their status changes to `"verified"`

### 2. Verification Process

- Admins can review resident applications in the `/admin/residents` page
- They can view resident details including ID photos and selfie photos
- Admins can approve (`"verified"`) or reject (`"rejected"`) residents
- When verification status changes, both collections are updated simultaneously

### 3. Login Prevention

- The `ensureUserProfileAction` checks verification status during login
- Unverified residents receive an error message and are signed out
- Only verified residents can successfully log in

## Database Structure

### Users Collection

```typescript
{
	uid: string;
	email: string;
	role: "resident" | "official" | "admin";
	verificationStatus: "pending" | "verified" | "rejected";
	// ... other fields
}
```

### Residents Collection

```typescript
{
  uid: string;
  verification: {
    status: "pending" | "verified" | "rejected";
    idFrontPhotoUrl: string;
    idBackPhotoUrl: string;
    selfiePhotoUrl: string;
    submittedAt: number;
    reviewedAt?: number;
    reviewedBy?: string;
    notes?: string;
  };
  // ... other fields
}
```

## Key Components

### 1. Auth Actions (`app/actions/auth.ts`)

- `ensureUserProfileAction`: Checks verification status during login
- `createUserProfileAction`: Sets initial verification status
- `updateUserProfileAction`: Updates user profile data

### 2. Residents Actions (`app/actions/residents.ts`)

- `updateResidentVerificationAction`: Updates verification status in both collections
- `getResidentsAction`: Retrieves residents with verification status
- `getResidentDetailsAction`: Gets detailed resident information

### 3. Login Form (`components/login-form.tsx`)

- Handles login attempts
- Shows verification error messages
- Displays informational message about verification process

### 4. Admin Residents Page (`app/admin/residents/page.tsx`)

- Lists all residents with their verification status
- Allows admins to review and verify residents
- Shows verification status badges

## Verification Statuses

- **`pending`**: New resident, awaiting admin review
- **`verified`**: Resident approved, can log in
- **`rejected`**: Resident rejected, cannot log in

## Error Messages

### Pending Verification

```
"Your account is pending verification. Please wait for admin approval before logging in."
```

### Rejected Verification

```
"Your account verification was rejected. Please contact the barangay office for assistance."
```

## Testing the System

### 1. Register a New Resident

1. Go to `/register`
2. Fill out the registration form
3. Submit the form
4. The resident account will be created with `verificationStatus: "pending"`

### 2. Try to Login (Should Fail)

1. Go to `/login`
2. Use the newly registered credentials
3. Login should fail with verification error
4. User should be signed out automatically

### 3. Admin Verification

1. Login as admin
2. Go to `/admin/residents`
3. Find the pending resident
4. Click "View Details" or "Review"
5. Review the resident's information and photos
6. Approve or reject the resident

### 4. Test Login After Verification

1. If approved, the resident should now be able to login
2. If rejected, the resident should still see rejection error

## Security Features

- Verification status is checked on every login attempt
- Status is synchronized between `users` and `residents` collections
- Failed verification attempts automatically sign out the user
- Only admins can change verification status

## Language Support

The system supports both English and Tagalog:

- English: "New residents must be verified by an admin before they can log in..."
- Tagalog: "Ang mga bagong residente ay dapat na ma-verify muna ng admin..."

## Troubleshooting

### Common Issues

1. **Verification status not syncing**

   - Check that `updateResidentVerificationAction` is updating both collections
   - Verify database rules allow updates to both paths

2. **Login still works for unverified residents**

   - Ensure `ensureUserProfileAction` is being called during login
   - Check that verification status is being read correctly

3. **Admin can't see verification options**
   - Verify admin permissions include `canManageResidents`
   - Check that the residents page is properly loading verification data

### Debug Steps

1. Check browser console for error messages
2. Verify database values in Firebase console
3. Test with a known verified vs unverified account
4. Check server action logs for verification status checks

## Future Enhancements

- Email notifications when verification status changes
- Bulk verification for multiple residents
- Verification history and audit trail
- Automatic verification for certain criteria
- Integration with external verification services

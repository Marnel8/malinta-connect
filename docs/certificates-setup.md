# Certificates System Setup

This document explains how to set up and use the certificates management system in Malinta Connect.

## Overview

The certificates system allows administrators to manage certificate requests from residents, including:

- Barangay Clearance
- Certificate of Residency
- Certificate of Indigency
- And other official documents

## Features

- **Create Certificate Requests**: Add new certificate requests for residents
- **Status Management**: Track requests through various stages (pending → processing → ready → completed)
- **Search & Filter**: Find specific requests by search query or status
- **Rejection Handling**: Reject requests with documented reasons
- **Real-time Updates**: All changes are immediately reflected in the database

## Database Structure

The system uses Firebase Realtime Database with the following structure:

```json
{
	"certificates": {
		"certificate_id": {
			"type": "Barangay Clearance",
			"requestedBy": "Juan Dela Cruz",
			"requestedOn": "April 22, 2025",
			"status": "processing",
			"purpose": "Job application",
			"estimatedCompletion": "April 24, 2025",
			"notes": "Standard processing time applies",
			"completedOn": null,
			"rejectedReason": null,
			"createdAt": 1713744000000,
			"updatedAt": 1713744000000
		}
	}
}
```

## Status Flow

1. **Pending** → Initial state when request is created
2. **Processing** → Request is being worked on
3. **Ready** → Certificate is ready for pickup
4. **Completed** → Certificate has been delivered/collected
5. **Rejected** → Request was rejected with reason
6. **Additional Info** → More information is needed

## Setup Instructions

### 1. Install Dependencies

Make sure you have the required dependencies:

```bash
pnpm install
```

### 2. Seed Sample Data

Run the seed script to populate the database with sample certificates:

```bash
pnpm run seed:certificates
```

This will create 6 sample certificate requests with different statuses.

### 3. Start the Development Server

```bash
pnpm run dev
```

### 4. Access the Certificates Page

Navigate to `/admin/certificates` to access the certificates management interface.

## Usage

### Creating a New Certificate Request

1. Click the "New Certificate Request" button
2. Fill in the required fields:
   - Certificate Type (required)
   - Requested By (required)
   - Purpose (required)
   - Estimated Completion (optional)
   - Notes (optional)
3. Click "Create Request"

### Managing Certificate Status

- **Start Processing**: Move from pending to processing
- **Mark as Ready**: Move from processing to ready
- **Mark as Completed**: Move from ready to completed
- **Reject**: Move to rejected with reason

### Searching and Filtering

- Use the search bar to find requests by name, type, purpose, or ID
- Use the status filter to view requests by specific status
- Combine both for precise filtering

## API Endpoints

All certificate operations are handled through server actions in `app/actions/certificates.ts`:

- `getAllCertificatesAction()` - Fetch all certificates
- `getCertificateAction(id)` - Fetch single certificate
- `createCertificateAction(data)` - Create new certificate
- `updateCertificateAction(data)` - Update certificate
- `deleteCertificateAction(id)` - Delete certificate
- `updateCertificateStatusAction(id, status)` - Update status
- `getCertificatesByStatusAction(status)` - Filter by status
- `searchCertificatesAction(query)` - Search certificates

## Error Handling

The system includes comprehensive error handling:

- Toast notifications for success/error states
- Loading indicators for async operations
- Form validation for required fields
- Graceful fallbacks for failed operations

## Security

- All operations are performed through server actions
- Firebase Admin SDK is used for secure database access
- Input validation and sanitization
- Proper error handling without exposing sensitive information

## Customization

### Adding New Certificate Types

Edit the `certificateTypes` array in `components/admin/certificate-form.tsx`:

```typescript
const certificateTypes = [
	"Barangay Clearance",
	"Certificate of Residency",
	"Certificate of Indigency",
	"Your New Type Here",
	// ... other types
];
```

### Modifying Status Flow

Update the status logic in `app/admin/certificates/page.tsx` to match your workflow requirements.

### Styling

The system uses Tailwind CSS and shadcn/ui components. Customize the appearance by modifying the component classes or creating new UI components.

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**

   - Check your Firebase configuration in `app/firebase/firebase.ts`
   - Verify your service account credentials in `app/firebase/admin.ts`

2. **Database Permission Errors**

   - Ensure your Firebase Realtime Database rules allow read/write access
   - Check that your service account has the necessary permissions

3. **Toast Notifications Not Working**
   - Verify the toast provider is properly set up in your layout
   - Check that `useToast` hook is imported correctly

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and Firebase operation logs.

## Support

For additional support or feature requests, please refer to the project documentation or contact the development team.

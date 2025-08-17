# Certificate Email System

This directory contains the email system for Malinta Connect, specifically designed to send certificate status update emails using EJS templates.

## 📁 File Structure

```
mails/
├── index.ts                 # Main email functions and configuration
├── certificate-examples.ts  # Usage examples for certificate emails
├── example-usage.ts        # General email usage examples
├── README.md               # This documentation
└── templates/              # EJS email templates
    ├── certificate-pending.ejs     # Pending status template
    ├── certificate-processing.ejs  # Processing status template
    ├── certificate-approved.ejs    # Ready for pickup template
    ├── certificate-rejected.ejs    # Rejected status template
    └── certificate-additional-info.ejs # Additional info required template
```

## 🚀 Quick Start

### 1. Environment Variables

Set up your SMTP configuration in your `.env` file:

```bash
# Required
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional
SMTP_FROM=noreply@malinta-connect.com
```

### 2. Basic Usage

````typescript
import {
	sendCertificatePendingEmail,
	sendCertificateProcessingEmail,
	sendCertificateReadyEmail,
} from "./mails";

// Send pending notification
await sendCertificatePendingEmail("user@example.com", {
	userName: "Juan Dela Cruz",
	referenceNumber: "CERT-2024-001",
	certificateType: "Barangay Clearance",
	requestDate: "January 15, 2024",
	purpose: "Employment requirement",
});

// Send processing notification
await sendCertificateProcessingEmail("user@example.com", {
	userName: "Juan Dela Cruz",
	referenceNumber: "CERT-2024-001",
	certificateType: "Barangay Clearance",
	requestDate: "January 15, 2024",
	purpose: "Employment requirement",
	processingStartDate: "January 16, 2024",
	estimatedCompletionDate: "January 20, 2024",
	estimatedDays: "3-5",
});

// Send ready notification
await sendCertificateReadyEmail("user@example.com", {
	userName: "Juan Dela Cruz",
	referenceNumber: "CERT-2024-001",
	certificateType: "Barangay Clearance",
	requestDate: "January 15, 2024",
	purpose: "Employment requirement",
	approvalDate: "January 19, 2024",
	processingTime: "4",
	pickupLocation: "Malinta Barangay Hall, Main Office",
	pickupHours: "8:00 AM - 5:00 PM",
});

// Send rejection notification
await sendCertificateRejectedEmail("user@example.com", {
	userName: "Juan Dela Cruz",
	referenceNumber: "CERT-2024-001",
	certificateType: "Barangay Clearance",
	requestDate: "January 15, 2024",
	purpose: "Employment requirement",
	rejectedReason: "Incomplete documentation. Please provide valid ID and proof of residence.",
});

// Send additional info request
await sendCertificateAdditionalInfoEmail("user@example.com", {
	userName: "Juan Dela Cruz",
	referenceNumber: "CERT-2024-001",
	certificateType: "Barangay Clearance",
	requestDate: "January 15, 2024",
	purpose: "Employment requirement",
	additionalInfoRequest: "Please provide additional proof of residence and employment letter.",
});

## 📧 Email Templates

### Certificate Pending Template

- **File**: `certificate-pending.ejs`
- **Status**: Pending (Yellow/Orange theme)
- **Use Case**: When a certificate request is first submitted
- **Variables**: Basic request information

### Certificate Processing Template

- **File**: `certificate-processing.ejs`
- **Status**: Processing (Purple theme)
- **Use Case**: When a certificate request moves to processing
- **Variables**: Includes processing dates and estimates

### Certificate Ready Template

- **File**: `certificate-approved.ejs`
- **Status**: Ready (Green theme)
- **Use Case**: When a certificate is approved and ready for pickup
- **Variables**: Includes pickup instructions and location

### Certificate Rejected Template

- **File**: `certificate-rejected.ejs`
- **Status**: Rejected (Red theme)
- **Use Case**: When a certificate request is rejected
- **Variables**: Includes rejection reason and next steps

### Certificate Additional Info Template

- **File**: `certificate-additional-info.ejs`
- **Status**: Additional Info Required (Orange theme)
- **Use Case**: When additional information is needed to process a request
- **Variables**: Includes information request details and instructions

## 🔧 Available Functions

### Core Email Functions

- `sendEmail(emailContent)` - Send basic emails
- `sendTemplatedEmail(to, subject, template, variables)` - Send emails with variable substitution

### Certificate-Specific Functions

- `sendCertificatePendingEmail(to, data)` - Send pending status email
- `sendCertificateProcessingEmail(to, data)` - Send processing status email
- `sendCertificateReadyEmail(to, data)` - Send ready for pickup email
- `sendCertificateRejectedEmail(to, data)` - Send rejected status email
- `sendCertificateAdditionalInfoEmail(to, data)` - Send additional info request email
- `sendCertificateStatusEmail(to, status, data)` - Generic function for any status

### Utility Functions

- `verifySMTPConnection()` - Test SMTP connection
- `getTransporter()` - Get transporter instance
- `closeTransporter()` - Clean up transporter

## 📊 Data Interfaces

### CertificateRequestData (Base)

```typescript
interface CertificateRequestData {
	userName: string;
	referenceNumber: string;
	certificateType: string;
	requestDate: string;
	purpose: string;
	additionalRequirements?: string[];
	contactPhone?: string;
	contactEmail?: string;
}
````

### CertificateProcessingData (Extends Base)

```typescript
interface CertificateProcessingData extends CertificateRequestData {
	processingStartDate: string;
	estimatedCompletionDate: string;
	estimatedDays: string;
}
```

### CertificateReadyData (Extends Base)

```typescript
interface CertificateReadyData extends CertificateRequestData {
	approvalDate: string;
	processingTime: string;
	pickupLocation: string;
	pickupHours: string;
}
```

### CertificateRejectedData (Extends Base)

```typescript
interface CertificateRejectedData extends CertificateRequestData {
	rejectedReason: string;
}
```

### CertificateAdditionalInfoData (Extends Base)

```typescript
interface CertificateAdditionalInfoData extends CertificateRequestData {
	additionalInfoRequest: string;
}
```

## 🎨 Template Customization

### EJS Variables

All templates use EJS syntax for dynamic content:

- `<%= variableName %>` - Output variable value
- `<% if (condition) { %>` - Conditional blocks
- `<% } %>` - End conditional blocks

### Styling

Templates include inline CSS for email compatibility:

- Responsive design (max-width: 600px)
- Professional color schemes
- Status-specific badges and themes
- Mobile-friendly layout

## 📱 Template Features

- **Responsive Design**: Works on desktop and mobile
- **Professional Styling**: Clean, modern email design
- **Status Badges**: Visual indicators for each status
- **Progress Bars**: Visual progress indicators (processing template)
- **Call-to-Action Buttons**: Links to track status
- **Contact Information**: Office hours and contact details
- **Logo Integration**: Uses Malinta Connect branding

## 📊 Supported Statuses

The email system supports the following certificate statuses:

- **Pending** (`pending`) - Initial request submitted
- **Processing** (`processing`) - Request under review
- **Ready** (`ready`) - Certificate approved and ready for pickup
- **Completed** (`completed`) - Certificate picked up
- **Rejected** (`rejected`) - Request denied with reason
- **Additional Info** (`additionalInfo`) - More information needed

## 🚨 Error Handling

All functions include comprehensive error handling:

- SMTP connection validation
- Template file validation
- Variable substitution error handling
- Logging for debugging
- Graceful fallbacks

## 🔍 Testing

Test your email setup:

```typescript
import { verifySMTPConnection } from "./mails";

// Test SMTP connection
const isConnected = await verifySMTPConnection();
if (isConnected) {
	console.log("✅ SMTP connection successful");
} else {
	console.log("❌ SMTP connection failed");
}
```

## 📝 Notes

- **Server Actions Only**: Remember to use these functions in server actions, not client components
- **Environment Variables**: Ensure all SMTP variables are properly set
- **Template Paths**: Templates are loaded from the `mails/templates/` directory
- **Error Logging**: Check console logs for detailed error information
- **Rate Limiting**: Be mindful of email sending limits for your SMTP provider

## 🆘 Troubleshooting

### Common Issues

1. **SMTP Connection Failed**: Check environment variables and SMTP credentials
2. **Template Not Found**: Verify template files exist in the correct directory
3. **Email Not Sending**: Check console logs for specific error messages
4. **Template Rendering Issues**: Verify EJS syntax and variable names

### Debug Steps

1. Test SMTP connection with `verifySMTPConnection()`
2. Check environment variables are loaded
3. Verify template file paths
4. Review console error logs
5. Test with simple email first, then complex templates

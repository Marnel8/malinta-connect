# Certificate Generation Feature

This document describes the new certificate generation feature that allows staff and admins to generate PDF certificates with the official Malinta Barangay format.

## Overview

The certificate generation feature provides:

1. **PDF Certificate Generation**: Creates certificates matching the official Barangay format
2. **Signature Management**: Allows staff/admins to attach official signatures
3. **Certificate Preview**: Preview certificates before generating
4. **Download Functionality**: Direct PDF download for printing

## Certificate Format

The generated certificates follow the official format with:

- **Header**: Republic of the Philippines, Province of Laguna, Municipality of Los Baños, Barangay Malinta
- **Left Sidebar**: Complete list of Sangguniang Barangay officials
- **Main Content**: Certificate of Indigency with resident details
- **Signature Section**: Optional official signature
- **Footer**: Official address and contact information

## Components Added

### 1. Certificate PDF Generator (`lib/certificate-pdf-generator.ts`)

- Generates PDF directly using pdf-lib for pixel-perfect accuracy
- Precise control over fonts, colors, positioning, and layout
- Professional-grade PDF output matching official certificate format
- Handles signature integration with exact positioning
- Provides preview functionality

### 2. Certificate Generator Modal (`components/admin/certificate-generator-modal.tsx`)

- Modal interface for generating certificates
- Signature upload functionality
- Certificate preview
- PDF download

### 3. Signature Management (`components/admin/signature-management.tsx`)

- Upload and manage official signatures
- Signature library for different officials
- Image validation and upload to Cloudinary

## Updated Files

### Database Schema

- **Certificate Interface**: Added fields for PDF generation:
  - `pdfUrl`: URL of generated PDF
  - `signatureUrl`: URL of attached signature
  - `hasSignature`: Boolean flag for signature presence
  - `generatedBy`: Staff member who generated the certificate
  - `generatedOn`: Generation timestamp

### Admin Interface

- **Admin Certificates Page**: Added "Generate Certificate" button for ready/completed certificates
- **Certificate Table**: Shows indicators for signed certificates and PDFs
- **View Details**: Displays signature and generation information

## Server Actions

### 1. `generateCertificatePDFAction`

- Generates PDF certificates with optional signatures
- Uploads signatures to Cloudinary
- Updates certificate records

### 2. `uploadSignatureAction`

- Handles signature file uploads
- Validates image files
- Updates certificate with signature URL

## Usage Instructions

### For Staff/Admins:

1. **Navigate to Admin > Certificates**
2. **Find a certificate** with status "Ready" or "Completed"
3. **Click the dropdown menu** and select "Generate Certificate"
4. **In the modal**:
   - Toggle "Include Official Signature" if desired
   - Upload a signature image if not already available
   - Click "Preview" to see the certificate layout
   - Click "Generate PDF" to download the certificate

### Signature Management:

1. **Upload signatures** through the certificate generator modal
2. **Signatures are stored** in Cloudinary under `/signatures/` folder
3. **Default signature** is available at `/images/e-sig.png`

## Technical Details

### Dependencies Added:

- `pdf-lib`: Professional PDF generation library for precise styling control

### File Storage:

- **Signatures**: Stored in Cloudinary under `malinta-connect/signatures/`
- **PDF URLs**: Can be stored in database for future reference

### Certificate Types Supported:

- Certificate of Indigency (primary implementation)
- Extensible for other certificate types

## Demo Page

A demo page is available at `/admin/certificates/demo` for testing the certificate generation feature with sample data.

## Future Enhancements

1. **Multiple Officials**: Support for different signing officials
2. **Certificate Templates**: Additional certificate types
3. **Batch Generation**: Generate multiple certificates at once
4. **Digital Signatures**: Integration with digital signature services
5. **Certificate Verification**: QR codes for certificate verification

## Security Notes

- Signature files are validated for type and size
- All uploads go through Cloudinary with proper folder organization
- Server-side validation ensures data integrity
- PDF generation uses pdf-lib for professional-quality output

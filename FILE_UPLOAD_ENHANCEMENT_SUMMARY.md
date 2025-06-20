# File Upload Enhancement Summary

## Overview
The CustomerKYC form has been enhanced to support multiple file uploads and dynamic bucket path creation based on customer names.

## Key Changes Made

### 1. Enhanced FileUpload Component (`/client/src/utils/FileUpload.js`)
- **Added `customerName` prop**: Allows passing customer name for dynamic path creation
- **Enhanced bucket path logic**: Automatically creates customer-specific folders when `bucketPath` is not provided
- **Folder sanitization**: Removes special characters and sanitizes folder names
- **Dynamic path format**: `customer-kyc/<Customer Name>/`

### 2. Enhanced AWS Upload Utility (`/client/src/utils/awsFileUpload.js`)
- **Dynamic bucket path creation**: Creates customer-specific paths when needed
- **Folder name sanitization**: Ensures safe folder names by removing special characters
- **Enhanced return data**: Includes `BucketPath` in response for tracking

### 3. Updated CustomerKycForm (`/client/src/components/CustomerKycForm.js`)
All FileUpload components now support:
- **Multiple uploads**: `multiple={true}` for all file sections
- **Dynamic bucket paths**: `customerName={formik.values.name_of_individual}`
- **Proper file appending**: Uses logic to append new files to existing arrays
- **Enhanced error handling**: Improved ImagePreview integration

#### Updated Sections:
- ✅ Authorised Signatory Photos
- ✅ Authorisation Letter  
- ✅ IEC Copy
- ✅ PAN Copy
- ✅ GST Registration (Factory Addresses)
- ✅ Other Documents
- ✅ SPCB Registration Certificate
- ✅ KYC Verification Images
- ✅ GST Returns

### 4. Enhanced Supporting Documents Hook (`/client/src/customHooks/useSupportingDocuments.js`)
- **Multiple uploads enabled**: All supporting document types now support multiple files
- **Customer name integration**: Dynamic bucket path creation for all document types
- **Consistent behavior**: All documents use the same upload logic

## Upload Logic Implementation

### Multiple File Upload Logic
```javascript
onFilesUploaded={(uploadedUrls, appendFiles = true) => {
  const currentFiles = formik.values.field_name || [];
  const newFiles = appendFiles ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
  formik.setFieldValue('field_name', newFiles);
  setFileSnackbar(true);
}}
```

### Dynamic Bucket Path Creation
```javascript
// Function to sanitize folder names
const sanitizeFolderName = (name) => {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces
};

// Create dynamic bucket path if needed
const createBucketPath = (originalBucketPath, customerName) => {
  if (!originalBucketPath && customerName) {
    const sanitizedCustomerName = sanitizeFolderName(customerName);
    return `customer-kyc/${sanitizedCustomerName}`;
  }
  return originalBucketPath;
};
```

## Folder Structure Example
If customer name is "ABC Exports Ltd.", documents will be stored in:
```
customer-kyc/ABC Exports Ltd/
├── authorised-signatories/
├── authorisation-letter/
├── iec-copy/
├── pan-copy/
├── gst-registration-0/
├── other-documents/
├── spcb-registration/
├── kyc-verification-images/
├── gst-returns/
└── supporting-documents/
```

## Benefits
1. **Organized Storage**: All customer documents are grouped under customer-specific folders
2. **Multiple Upload Support**: Users can upload multiple files for each document type
3. **Scalable Architecture**: Easy to extend for new document types
4. **Consistent UX**: Uniform upload behavior across all sections
5. **Error Prevention**: Sanitized folder names prevent file system issues

## Technical Notes
- All file fields in Formik are now arrays to support multiple uploads
- ImagePreview component handles both single files and arrays seamlessly
- Backward compatibility maintained for existing single-file uploads
- Mock S3 implementation updated to demonstrate the new folder structure

## Future Enhancements
- Real S3 integration with the new bucket path logic
- File type validation based on document category
- File size limits and compression
- Progress indicators for large file uploads
- Drag-and-drop upload interface

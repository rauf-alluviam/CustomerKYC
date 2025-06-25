
// Utility function to sanitize customer name for S3 bucket path
const sanitizeCustomerName = (customerName) => {
  if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
    return 'Unknown_Customer';
  }
  
  // Sanitize the customer name:
  // 1. Trim whitespace
  // 2. Replace spaces with underscores
  // 3. Replace special characters with underscores
  // 4. Remove consecutive underscores
  // 5. Remove leading/trailing underscores
  // 6. Ensure it's not empty after sanitization
  const sanitized = customerName
    .trim()
    .replace(/\s+/g, '_')                    // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_-]/g, '_')         // Replace special chars with underscores
    .replace(/_+/g, '_')                     // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '');               // Remove leading/trailing underscores
  
  return sanitized || 'Unknown_Customer';
};

// Function to handle multiple file upload to S3
export const handleFileUpload = async (event, fieldName, displayName, formik, setFileSnackbar, onError = null) => {
  const files = Array.from(event.target.files);
  
  if (!files.length) return;

  try {
    // Get and sanitize customer name from formik values for S3 organization
    const rawCustomerName = formik.values.name_of_individual;
    const sanitizedCustomerName = sanitizeCustomerName(rawCustomerName);
    
    console.log(`Original customer name: "${rawCustomerName}"`);
    console.log(`Sanitized customer name: "${sanitizedCustomerName}"`);
    console.log(`Uploading ${files.length} file(s) for customer: ${sanitizedCustomerName}`);
    
    // Create FormData for file upload
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('customerName', sanitizedCustomerName);
    formData.append('fieldName', fieldName);

    // Upload to S3 via backend API
    const response = await fetch(`${process.env.REACT_APP_API_STRING}/api/upload-files`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Set the S3 URLs in formik
    formik.setFieldValue(fieldName, result.fileUrls);
    
    // Log the S3 paths for verification
    if (result.files && result.files.length > 0) {
      console.log(`Files uploaded to S3 paths:`, result.files.map(f => ({
        originalName: f.originalName,
        s3Key: f.key,
        s3Path: f.key // The full S3 path/key
      })));
    }
    
    // Show success message
    if (setFileSnackbar) {
      setFileSnackbar(true);
      setTimeout(() => setFileSnackbar(false), 3000);
    }
    
    console.log(`Files uploaded to S3 for ${displayName}:`, result.files?.map(f => f.originalName) || []);
    
  } catch (error) {
    console.error(`File upload error for ${displayName}:`, error);
    
    // Call error handler if provided
    if (onError) {
      onError(error);
    }
    
    // Show error message
    if (setFileSnackbar) {
      // You might want to use a different snackbar for errors
      console.error('Upload failed:', error.message);
    }
  }
};

// Function for S3 upload used by FileUpload component
export const uploadFileToS3 = async (file, bucketPath, customerName) => {
  try {
    // Sanitize customer name for proper S3 path organization
    const sanitizedCustomerName = sanitizeCustomerName(customerName);
    
    console.log(`Original customer name: "${customerName}"`);
    console.log(`Sanitized customer name: "${sanitizedCustomerName}"`);
    console.log(`Uploading file "${file.name}" for customer: ${sanitizedCustomerName}`);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerName', sanitizedCustomerName);
    formData.append('fieldName', bucketPath || 'general');

    // Upload to S3 via backend API
    const response = await fetch(`${process.env.REACT_APP_API_STRING}/api/upload-file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`File uploaded to S3:`);
    console.log(`  - Original name: ${result.originalName}`);
    console.log(`  - S3 Key/Path: ${result.key}`);
    console.log(`  - Customer folder: ${sanitizedCustomerName}`);
    
    // Return S3 response format
    return {
      Location: result.fileUrl,
      Key: result.key,
      Bucket: process.env.REACT_APP_S3_BUCKET || 'default-bucket',
      originalName: result.originalName,
      size: result.size,
      customerName: sanitizedCustomerName,
      s3Path: result.key // Include the full S3 path for verification
    };
    
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const handleMultipleFileUpload = handleFileUpload;

// Function to handle single file upload to S3
export const handleSingleFileUpload = async (event, fieldName, displayName, formik, setFileSnackbar, onError = null) => {
  const file = event.target.files[0];
  
  if (!file) return;

  try {
    // Get customer name from formik values for S3 organization
    const customerName = formik.values.name_of_individual || 'Unknown_Customer';
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerName', customerName);
    formData.append('fieldName', fieldName);

    // Upload to S3 via backend API
    const response = await fetch(`${process.env.REACT_APP_API_STRING}/api/upload-file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Set the S3 URL in formik
    formik.setFieldValue(fieldName, result.fileUrl);
    
    // Show success message
    if (setFileSnackbar) {
      setFileSnackbar(true);
      setTimeout(() => setFileSnackbar(false), 3000);
    }
    
    console.log(`File uploaded to S3 for ${displayName}:`, result.originalName);
    
  } catch (error) {
    console.error(`File upload error for ${displayName}:`, error);
    
    // Call error handler if provided
    if (onError) {
      onError(error);
    }
    
    // Show error message
    if (setFileSnackbar) {
      console.error('Upload failed:', error.message);
    }
  }
};

// In a real application, you would implement actual file upload logic here:
/*
export const handleSingleFileUpload = async (event, fieldName, displayName, formik, setFileSnackbar) => {
  const file = event.target.files[0];
  
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      formik.setFieldValue(fieldName, data.fileUrl);
      if (setFileSnackbar) {
        setFileSnackbar(true);
        setTimeout(() => setFileSnackbar(false), 3000);
      }
    } else {
      throw new Error(data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('File upload error:', error);
    if (onError && typeof onError === 'function') {
      onError('File upload failed. Please try again.');
    }
  }
};
*/

// Mock function to handle multiple file upload
export const handleFileUpload = (event, fieldName, displayName, formik, setFileSnackbar) => {
  const files = Array.from(event.target.files);
  
  if (!files.length) return;

  // Create mock URLs for the files (in production, you'd upload to your server/cloud storage)
  const fileUrls = files.map(file => URL.createObjectURL(file));
  
  // Set the field value in formik
  formik.setFieldValue(fieldName, fileUrls);
  
  // Show success message
  if (setFileSnackbar) {
    setFileSnackbar(true);
    setTimeout(() => setFileSnackbar(false), 3000);
  }
  
  console.log(`Files uploaded for ${displayName}:`, files.map(f => f.name));
};

// Enhanced mock function for S3 upload used by FileUpload component
export const uploadFileToS3 = async (file, bucketPath, customerName) => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Function to sanitize folder names
  const sanitizeFolderName = (name) => {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
  };

  // Create dynamic bucket path if needed
  let finalBucketPath = bucketPath;
  if (!bucketPath && customerName) {
    const sanitizedCustomerName = sanitizeFolderName(customerName);
    finalBucketPath = `customer-kyc/${sanitizedCustomerName}`;
  }
  
  // Create a mock URL for the file
  const mockUrl = URL.createObjectURL(file);
  
  console.log(`Mock upload to S3 bucket path: ${finalBucketPath}, file: ${file.name}`);
  
  // Return mock S3 response format
  return {
    Location: mockUrl,
    Key: `${finalBucketPath}/${file.name}`,
    Bucket: 'mock-bucket',
    BucketPath: finalBucketPath
  };
};
/*
export const handleFileUpload = async (event, fieldName, displayName, formik, setFileSnackbar) => {
  const files = Array.from(event.target.files);
  
  if (!files.length) return;

  try {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldName', fieldName);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return data.fileUrl;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    });
    
    const fileUrls = await Promise.all(uploadPromises);
    
    formik.setFieldValue(fieldName, fileUrls);
    
    if (setFileSnackbar) {
      setFileSnackbar(true);
      setTimeout(() => setFileSnackbar(false), 3000);
    }
  } catch (error) {
    console.error('File upload error:', error);
    alert('File upload failed. Please try again.');
  }
};
*/

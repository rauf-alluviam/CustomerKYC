import React, { useState, useContext } from "react";
import { uploadFileToS3 } from "./awsFileUpload";
import { Button, CircularProgress, LinearProgress, Box, Typography } from "@mui/material";
import { UserContext } from "../contexts/UserContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

const FileUpload = ({
  label,
  onFilesUploaded,
  bucketPath,
  multiple = true,
  acceptedFileTypes = ['.zip', '.png', '.jpeg', '.jpg', '.pdf', '.doc', '.docx', '.xls', '.xlsx'], // Default allowed file types
  readOnly = false, // Default to false
  appendFiles = true, // New prop to control if files should be appended or replaced
  customerName = "", // New prop for customer name to create dynamic bucket path
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [error, setError] = useState("");
  const [retryAttempts, setRetryAttempts] = useState({});
  const { user } = useContext(UserContext);

  const MAX_RETRY_ATTEMPTS = 3;

  // Function to sanitize folder names
  const sanitizeFolderName = (name) => {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
  };

  // Function to create dynamic bucket path
  const createBucketPath = (originalBucketPath, customerName) => {
    if (!originalBucketPath && customerName) {
      const sanitizedCustomerName = sanitizeFolderName(customerName);
      return `${sanitizedCustomerName}`;
    }
    return originalBucketPath;
  };

  // Function to validate file types
  const validateFileType = (file) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    // Normalize accepted file types to lowercase
    const normalizedAcceptedTypes = acceptedFileTypes.map(type => type.toLowerCase());
    
    return normalizedAcceptedTypes.includes(fileExtension);
  };

  // Enhanced retry mechanism (without integrity verification)
  const uploadWithRetry = async (file, finalBucketPath, fileId) => {
    const maxRetries = MAX_RETRY_ATTEMPTS;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }));
        
        const result = await uploadFileToS3(
          file, 
          finalBucketPath, 
          customerName,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          }
        );
        
        setUploadStatus(prev => ({ ...prev, [fileId]: 'completed' }));
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        return result;
      } catch (error) {
        attempt++;
        setRetryAttempts(prev => ({ ...prev, [fileId]: attempt }));
        
        if (attempt >= maxRetries) {
          setUploadStatus(prev => ({ ...prev, [fileId]: 'failed' }));
          throw new Error(`Upload failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        setUploadStatus(prev => ({ ...prev, [fileId]: `retrying` }));
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  };

  // Function to get file size in MB
  const getFileSizeInMB = (file) => {
    return (file.size / (1024 * 1024)).toFixed(2);
  };

  const handleFileUpload = async (event) => {
    if (readOnly) return; // Prevent upload if readOnly is true

    const files = Array.from(event.target.files);
    setError(""); // Clear previous errors
    setUploadProgress({});
    setUploadStatus({});
    setRetryAttempts({});

    // Validate file types
    const invalidFiles = files.filter(file => !validateFileType(file));
    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map(file => file.name).join(', ');
      setError(`Invalid file type(s): ${invalidFileNames}. Only ${acceptedFileTypes.join(', ')} files are allowed.`);
      event.target.value = ''; // Clear the input
      return;
    }

    // Validate file sizes (max 10MB per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const oversizedFileNames = oversizedFiles.map(file => `${file.name} (${getFileSizeInMB(file)}MB)`).join(', ');
      setError(`File(s) too large: ${oversizedFileNames}. Maximum file size is 10MB.`);
      event.target.value = ''; // Clear the input
      return;
    }

    const uploadedFiles = [];
    const finalBucketPath = createBucketPath(bucketPath, customerName);

    setUploading(true);
    
    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${file.name}_${Date.now()}_${i}`;
        
        try {
          const result = await uploadWithRetry(file, finalBucketPath, fileId);
          uploadedFiles.push(result.Location);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setError(prev => {
            const newError = `Failed to upload ${file.name}: ${error.message}`;
            return prev ? `${prev}\n${newError}` : newError;
          });
          setUploadStatus(prev => ({ ...prev, [fileId]: 'failed' }));
        }
      }
    } finally {
      setUploading(false);
      // Clear the input after upload attempt
      event.target.value = '';
    }
    
    // Pass the uploaded files to the callback along with the appendFiles flag
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles, appendFiles);
      
      // Clear progress and status after successful callback
      setTimeout(() => {
        setUploadProgress({});
        setUploadStatus({});
        setRetryAttempts({});
      }, 3000);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <Button
        variant="contained"
        component="label"
        style={{
          backgroundColor: readOnly ? "#ccc" : "#1c1e22",
          color: "#fff",
          cursor: readOnly ? "not-allowed" : "pointer",
        }}
        disabled={readOnly || uploading} // Disable button when readOnly
      >
        {uploading ? "Uploading..." : label}
        <input
          type="file"
          hidden
          multiple={multiple}
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileUpload}
          disabled={readOnly || uploading} // Disable input when readOnly
        />
      </Button>
      
      {uploading && (
        <CircularProgress size={24} style={{ marginLeft: "10px" }} />
      )}
      
      {/* Progress indicators for individual files */}
      {Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mt: 2 }}>
          {Object.entries(uploadProgress).map(([fileId, progress]) => {
            const fileName = fileId.split('_')[0];
            const status = uploadStatus[fileId];
            const attempts = retryAttempts[fileId] || 0;
            
            return (
              <Box key={fileId} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.8rem' }}>
                    {fileName}
                  </Typography>
                  {status === 'completed' && (
                    <CheckCircleIcon sx={{ color: 'green', fontSize: '1rem', ml: 1 }} />
                  )}
                  {status === 'failed' && (
                    <ErrorIcon sx={{ color: 'red', fontSize: '1rem', ml: 1 }} />
                  )}
                  {status === 'retrying' && (
                    <RefreshIcon sx={{ color: 'orange', fontSize: '1rem', ml: 1 }} />
                  )}
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ height: 6, borderRadius: 3 }}
                  color={
                    status === 'completed' ? 'success' : 
                    status === 'failed' ? 'error' : 
                    status === 'retrying' ? 'warning' : 'primary'
                  }
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {status === 'uploading' && `${Math.round(progress)}%`}
                    {status === 'completed' && 'Upload complete ✓'}
                    {status === 'failed' && 'Upload failed ✗'}
                    {status === 'retrying' && `Retrying... (${attempts}/${MAX_RETRY_ATTEMPTS})`}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
      
      {error && (
        <div style={{ 
          color: "#d32f2f", 
          fontSize: "12px", 
          marginTop: "8px",
          backgroundColor: "#ffebee",
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ffcdd2",
          whiteSpace: "pre-line"
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        fontSize: "11px", 
        color: "#666", 
        marginTop: "4px" 
      }}>
        Allowed files: {acceptedFileTypes.join(', ')} (Max 10MB each)
        {uploading && (
          <div style={{ marginTop: "4px", color: "#1976d2" }}>
            📤 Files are being uploaded...
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

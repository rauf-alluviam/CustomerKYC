import React, { useState, useContext } from "react";
import { uploadFileToS3 } from "./awsFileUpload";
import { Button, CircularProgress } from "@mui/material";
import { UserContext } from "../contexts/UserContext";

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
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

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

  // Function to get file size in MB
  const getFileSizeInMB = (file) => {
    return (file.size / (1024 * 1024)).toFixed(2);
  };

  const handleFileUpload = async (event) => {
    if (readOnly) return; // Prevent upload if readOnly is true

    const files = Array.from(event.target.files);
    setError(""); // Clear previous errors

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

    // Create dynamic bucket path if needed
    const finalBucketPath = createBucketPath(bucketPath, customerName);

    setUploading(true);
    for (const file of files) {
      try {
        const result = await uploadFileToS3(file, finalBucketPath);
        uploadedFiles.push(result.Location);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        setError(`Failed to upload ${file.name}. Please try again.`);
      }
    }
    setUploading(false);
    
    // Clear the input after successful upload
    event.target.value = '';
    
    // Pass the uploaded files to the callback along with the appendFiles flag
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles, appendFiles);
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
      {error && (
        <div style={{ 
          color: "#d32f2f", 
          fontSize: "12px", 
          marginTop: "8px",
          backgroundColor: "#ffebee",
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ffcdd2"
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
      </div>
    </div>
  );
};

export default FileUpload;

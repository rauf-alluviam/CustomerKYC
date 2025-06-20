import React, { useState, useContext } from "react";
import { uploadFileToS3 } from "./awsFileUpload";
import { Button, CircularProgress } from "@mui/material";
import { UserContext } from "../contexts/UserContext";

const FileUpload = ({
  label,
  onFilesUploaded,
  bucketPath,
  multiple = true,
  acceptedFileTypes = [],
  readOnly = false, // Default to false
  appendFiles = true, // New prop to control if files should be appended or replaced
  customerName = "", // New prop for customer name to create dynamic bucket path
}) => {
  const [uploading, setUploading] = useState(false);
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
      return `customer-kyc/${sanitizedCustomerName}`;
    }
    return originalBucketPath;
  };

  const handleFileUpload = async (event) => {
    if (readOnly) return; // Prevent upload if readOnly is true

    const files = event.target.files;
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
      }
    }
    setUploading(false);
    
    // Pass the uploaded files to the callback along with the appendFiles flag
    onFilesUploaded(uploadedFiles, appendFiles);
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
        {label}
        <input
          type="file"
          hidden
          multiple={multiple}
          accept={acceptedFileTypes.length ? acceptedFileTypes.join(",") : ""}
          onChange={handleFileUpload}
          disabled={readOnly || uploading} // Disable input when readOnly
        />
      </Button>
      {uploading && (
        <CircularProgress size={24} style={{ marginLeft: "10px" }} />
      )}
    </div>
  );
};

export default FileUpload;

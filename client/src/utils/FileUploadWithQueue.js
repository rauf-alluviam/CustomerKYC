import React, { useState } from "react";
import { Button, CircularProgress, Chip, Box, Typography } from "@mui/material";
import { CloudUpload, Queue, CheckCircle, Error } from "@mui/icons-material";
import { useFileUploadQueue } from "../contexts/FileUploadQueueContext";

const FileUploadWithQueue = ({
  label,
  onFilesQueued, // Called when files are queued (not uploaded yet)
  bucketPath,
  multiple = true,
  acceptedFileTypes = ['.zip', '.png', '.jpeg', '.jpg', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  readOnly = false,
  fieldName, // Required for queue processing
}) => {
  const [error, setError] = useState("");
  const [queuedItemIds, setQueuedItemIds] = useState([]);
  const { queueFiles, uploadQueue, getQueueStats } = useFileUploadQueue();

  // Function to sanitize folder names
  const sanitizeFolderName = (name) => {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
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

  const handleFileSelection = async (event) => {
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

    console.log(`📁 Queueing ${files.length} files for field: ${fieldName}`);

    // Queue the files for later upload
    const itemIds = queueFiles(
      files, 
      bucketPath, 
      fieldName,
      (uploadedUrls, fieldName) => {
        // This callback will be executed after successful upload
        if (onFilesQueued) {
          onFilesQueued(uploadedUrls, fieldName, true); // true indicates this is from queue processing
        }
      }
    );

    setQueuedItemIds(prev => [...prev, ...itemIds]);

    // Clear the input
    event.target.value = '';

    // Immediately call onFilesQueued with placeholder values to show files are selected
    if (onFilesQueued) {
      const filePlaceholders = files.map(file => `queued:${file.name}`);
      onFilesQueued(filePlaceholders, fieldName, false); // false indicates this is just queuing
    }

    console.log(`✅ Queued ${files.length} files for upload`);
  };

  // Get current queue items for this field
  const currentQueueItems = uploadQueue.filter(item => 
    queuedItemIds.includes(item.id)
  );

  const queueStats = getQueueStats();

  return (
    <div style={{ marginTop: "10px" }}>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUpload />}
        style={{
          backgroundColor: readOnly ? "#ccc" : "#1c1e22",
          color: "#fff",
          cursor: readOnly ? "not-allowed" : "pointer",
        }}
        disabled={readOnly}
      >
        {label}
        <input
          type="file"
          hidden
          multiple={multiple}
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileSelection}
          disabled={readOnly}
        />
      </Button>

      {/* Queue Status Display */}
      {currentQueueItems.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            📋 Queued Files ({currentQueueItems.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {currentQueueItems.map(item => (
              <Chip
                key={item.id}
                label={item.file.name}
                size="small"
                icon={
                  item.status === 'queued' ? <Queue /> :
                  item.status === 'uploading' ? <CircularProgress size={16} /> :
                  item.status === 'completed' ? <CheckCircle /> :
                  <Error />
                }
                color={
                  item.status === 'queued' ? 'default' :
                  item.status === 'uploading' ? 'primary' :
                  item.status === 'completed' ? 'success' :
                  'error'
                }
                variant={item.status === 'completed' ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
          
          {queueStats.total > 0 && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666' }}>
              Total queue: {queueStats.queued} queued, {queueStats.uploading} uploading, {queueStats.completed} completed, {queueStats.failed} failed
            </Typography>
          )}
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
        {currentQueueItems.length > 0 && (
          <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
            {' '}• Files will upload after form submission
          </span>
        )}
      </div>
    </div>
  );
};

export default FileUploadWithQueue;

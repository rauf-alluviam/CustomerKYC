import React, { useState, useContext } from "react";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from "@mui/material";
import { UserContext } from "../contexts/UserContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import DeleteIcon from "@mui/icons-material/Delete";

const ImagePreview = ({ 
  images, 
  onDeleteImage, 
  readOnly = false, 
  showDeleteForAdmin = true,
  allowUserDelete = false,
  applicationStatus = null,
  currentUserId = null,
  applicationCreatorId = null
}) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const { user } = useContext(UserContext);
  const { showError, showSuccess } = useSnackbar();

  // Enhanced permission logic for delete functionality
  const canDelete = (() => {
    if (readOnly) return false;
    
    // Admin can always delete (for submitted applications)
    if (user?.role === "Admin" && showDeleteForAdmin) return true;
    
    // User can delete their own documents in draft mode
    if (allowUserDelete) {
      // Check if it's a draft or the user is the creator
      const isDraft = applicationStatus === 'Draft' || applicationStatus === 'draft' || applicationStatus === null;
      const isCreator = currentUserId && applicationCreatorId && currentUserId === applicationCreatorId;
      
      return isDraft || isCreator;
    }
    
    return false;
  })();

  // Ensure `images` is always an array and handle both string URLs and object URLs
  // Filter out empty/invalid URLs
  const imageArray = Array.isArray(images) 
    ? images
        .map(img => typeof img === 'object' && img !== null ? img.url : img)
        .filter(url => url && typeof url === 'string' && url.trim() !== '')
    : images && typeof images === 'string' && images.trim() !== ''
      ? [typeof images === 'object' && images !== null ? images.url : images] 
      : [];

  // Function to extract the file name from the URL, with error handling
  const extractFileName = (url) => {
    try {
      if (!url) return "Unknown file";
      const parts = url.split("/");
      return decodeURIComponent(parts[parts.length - 1]);
    } catch (error) {
      console.error("Failed to extract file name:", error);
      return "File name unavailable"; // Fallback if extraction fails
    }
  };

  const handleDeleteClick = (index) => {
    if (canDelete) {
      setDeleteIndex(index);
      setOpenDeleteDialog(true);
    } else {
      let errorMessage = "You do not have permission to delete files.";
      
      if (applicationStatus && applicationStatus !== 'Draft' && applicationStatus !== 'draft') {
        errorMessage = "Documents cannot be deleted after submission. Only admins can delete submitted application files.";
      } else if (currentUserId && applicationCreatorId && currentUserId !== applicationCreatorId) {
        errorMessage = "You can only delete documents from applications you created.";
      } else {
        errorMessage = "You do not have permission to delete files.";
      }
      
      showError(errorMessage);
    }
  };

  const confirmDelete = async () => {
    const imageUrl = imageArray[deleteIndex];
  
    try {
      // Extract the S3 key from the URL correctly
      let key;
      if (imageUrl.includes('amazonaws.com/')) {
        // For S3 URLs like https://bucket.s3.region.amazonaws.com/key
        key = imageUrl.split('amazonaws.com/')[1];
      } else if (imageUrl.includes('s3.')) {
        // For S3 URLs like https://s3.region.amazonaws.com/bucket/key
        const urlParts = imageUrl.split('/');
        key = urlParts.slice(4).join('/'); // Skip protocol, domain, bucket
      } else {
        // Fallback: try to extract from pathname
        key = new URL(imageUrl).pathname.slice(1);
      }

      console.log('Admin deleting S3 key:', key);

      const response = await fetch(`${process.env.REACT_APP_API_STRING}/api/delete-s3-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });
  
      if (response.ok) {
        onDeleteImage(deleteIndex);
        showSuccess('File deleted successfully by admin');
        console.log('File deleted successfully from S3 by admin');
      } else {
        const errorData = await response.json();
        console.error('Failed to delete file from S3:', errorData);
        showError("Failed to delete file from S3. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      showError("Error deleting file. Please try again.");
    }
  
    setOpenDeleteDialog(false);
  };
  

  return (
    <Box mt={1} style={{ maxHeight: "150px", overflowY: "auto" }}>
      {imageArray.length > 0 ? (
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Document Name</TableCell>
              <TableCell>View</TableCell>
              {canDelete && <TableCell>Admin Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {imageArray.map((link, index) => (
              <TableRow key={index}>
                <TableCell>
                  {extractFileName(link)}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    View
                  </button>
                </TableCell>
                {canDelete && (
                  <TableCell>
                    <IconButton
                      onClick={() => handleDeleteClick(index)}
                      color="error"
                      size="small"
                      title="Delete file (Admin only)"
                      sx={{
                        backgroundColor: '#ffebee',
                        '&:hover': {
                          backgroundColor: '#ffcdd2'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No documents uploaded yet.</p>
      )}
      {canDelete && (
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirm Delete (Admin Action)</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this file? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" autoFocus>
              Delete File
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ImagePreview;
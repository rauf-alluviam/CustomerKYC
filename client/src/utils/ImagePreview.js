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

const ImagePreview = ({ images, onDeleteImage, readOnly = false }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const { user } = useContext(UserContext);
  const { showError, showSuccess } = useSnackbar();

  // Ensure `images` is always an array and handle both string URLs and object URLs
  const imageArray = Array.isArray(images) 
    ? images.map(img => typeof img === 'object' && img !== null ? img.url : img)
    : images 
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
    if (user.role === "Admin") {
      setDeleteIndex(index);
      setOpenDeleteDialog(true);
    } else {
      showError("You do not have permission to delete images.");
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

      console.log('Deleting S3 key:', key);

      const response = await fetch(`${process.env.REACT_APP_API_STRING}/api/delete-s3-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });
  
      if (response.ok) {
        onDeleteImage(deleteIndex);
        showSuccess('Image deleted successfully');
        console.log('Image deleted successfully from S3');
      } else {
        const errorData = await response.json();
        console.error('Failed to delete image from S3:', errorData);
        showError("Failed to delete image from S3.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      showError("Error deleting image.");
    }
  
    setOpenDeleteDialog(false);
  };
  

  return (
    <Box mt={1} style={{ maxHeight: "150px", overflowY: "auto" }}>
      {imageArray.length > 0 ? (
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Image Name</TableCell>
              {!readOnly && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {imageArray.map((link, index) => (
              <TableRow key={index}>
                <TableCell>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "blue" }}
                    >
                      {extractFileName(link)}
                    </a>
                  ) : (
                    "Invalid image link"
                  )}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <IconButton
                      onClick={() => handleDeleteClick(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No asset uploaded yet.</p>
      )}
      {!readOnly && (
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this image?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ImagePreview;
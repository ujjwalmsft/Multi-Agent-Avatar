import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface PrescriptionUploadProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  onUploadComplete: (response: any) => void;
  onUpload: (file: File) => Promise<any>;
}

const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({
  open,
  onClose,
  sessionId,
  onUploadComplete,
  onUpload
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
        setError('Please select an image or PDF file');
        setFile(null);
        setPreview(null);
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        setFile(null);
        setPreview(null);
        return;
      }

      setFile(selectedFile);
      setError(null);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // Show PDF icon for PDFs
        setPreview(null);
      }
    }
  };

// Update the handleUpload function to maintain session continuity
const handleUpload = async () => {
  if (!file || !sessionId) return;

  try {
    setUploading(true);
    setError(null);
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    const accessToken = localStorage.getItem('accessToken');
    // Make a direct API call instead of using onUpload to keep the same component context

    /*
    if (!accessToken) {
      throw new Error('Authentication token is missing. Please log in again.');
    }
      */
    // Make a direct API call with authentication header

    //for running locally
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/conversation/${sessionId}/upload`, {
    

    //for running on hosted azure enviorment
    // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://healthcare-agent-backend-dxeyhff2d5amgwc0.eastus2-01.azurewebsites.net'}/conversation/${sessionId}/upload`, {


      method: 'POST',
      // headers: {
      //   // No Content-Type header - browser will set it with boundary for FormData
      //   'Authorization': `Bearer ${accessToken}` // Add Authorization header with token
      // },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Call onUploadComplete with the result
    onUploadComplete(data);
    onClose();
  } catch (err: any) {
    setError(err.message || 'Failed to upload file');
  } finally {
    setUploading(false);
  }
};

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Simulate file input change
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        
        // Manually trigger change handler
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <Dialog open={open} onClose={!uploading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Prescription</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box 
          sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            p: 3, 
            textAlign: 'center',
            mb: 2,
            bgcolor: '#f8f8f8',
            position: 'relative'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Uploading prescription...</Typography>
            </Box>
          ) : (
            <>
              <input
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              
              {!file ? (
                <Box>
                  <CloudUploadIcon fontSize="large" sx={{ color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Drag and drop your prescription here
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    or
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                    Supported formats: JPG, PNG, PDF (Max 10MB)
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {preview ? (
                    <Box sx={{ mb: 2, maxHeight: '200px', overflow: 'hidden' }}>
                      <img 
                        src={preview} 
                        alt="Prescription preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                      />
                    </Box>
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      <PictureAsPdfIcon sx={{ fontSize: 80, color: '#f44336' }} />
                    </Box>
                  )}
                  
                  <Typography variant="body2">
                    <strong>Selected file:</strong> {file.name}
                  </Typography>
                  
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ mt: 1 }}
                  >
                    Change File
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleUpload} 
          disabled={!file || uploading} 
          startIcon={<CloudUploadIcon />}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrescriptionUpload;
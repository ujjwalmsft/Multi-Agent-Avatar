"use client";
 
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  userDetails: Record<string, string | number>;
  onConfirm: () => void;
  onCancel: () => void;
}
 
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  userDetails,
  onConfirm,
  onCancel,
}) => {
  React.useEffect(() => {
    console.log('ConfirmationDialog opened with details:', userDetails);
  }, []);
 
  const formattedDetails = Object.entries(userDetails)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
 
  return (
<Dialog open={open} onClose={onCancel}>
<DialogTitle>Confirm Your Details</DialogTitle>
<DialogContent>
<DialogContentText>
          Please confirm the details collected below:
<pre>{formattedDetails}</pre>
</DialogContentText>
</DialogContent>
<DialogActions>
<Button onClick={onCancel} color="secondary">Update</Button>
<Button onClick={onConfirm} color="primary" autoFocus>Confirm</Button>
</DialogActions>
</Dialog>
  );
};
 
export default ConfirmationDialog;
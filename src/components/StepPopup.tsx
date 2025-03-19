// src/components/StepPopup.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface StepPopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
  buttonText: string;
  buttonAction?: () => void;
  buttonDisabled?: boolean; // New prop to disable the action button
}

const StepPopup = ({
  open,
  onClose,
  title,
  text,
  buttonText,
  buttonAction,
  buttonDisabled = false,
}: StepPopupProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
        <Button
          onClick={() => {
            if (buttonAction) buttonAction();
            onClose(); // Close popup after action unless disabled
          }}
          color="primary"
          variant="contained"
          disabled={buttonDisabled}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StepPopup;
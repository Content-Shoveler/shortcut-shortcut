import React from 'react';
import { Alert, Snackbar, CircularProgress } from '@mui/material';
import { useSettings } from '../../store/SettingsContext';

export const OperationFeedback: React.FC = () => {
  const { operationState } = useSettings();
  const { operation, isProcessing, error } = operationState || {};
  
  // Show loading indicator during processing
  if (isProcessing) {
    return (
      <Snackbar open={true} autoHideDuration={null}>
        <Alert 
          severity="info" 
          icon={<CircularProgress size={20} color="inherit" />}
        >
          Updating {operation}...
        </Alert>
      </Snackbar>
    );
  }
  
  // Show error if there is one
  if (error) {
    return (
      <Snackbar open={true} autoHideDuration={6000}>
        <Alert severity="error">
          Failed to update {operation}: {error.message}
        </Alert>
      </Snackbar>
    );
  }
  
  return null;
};

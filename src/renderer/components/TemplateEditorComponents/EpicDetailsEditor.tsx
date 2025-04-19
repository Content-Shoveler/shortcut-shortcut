import React, { useState, useEffect } from 'react';
import {
  Typography,
  FormControl,
  MenuItem,
  Box,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  CyberCard, 
  CyberTextField, 
  CyberSelect 
} from '../cyberpunk';
import { EpicDetails } from '../../types';
import { EpicStateSelector } from '../ShortcutFields';
import { ShortcutEpicState } from '../../types/shortcutApi';
import { useShortcutApi } from '../../hooks/useShortcutApi';

interface EpicDetailsEditorProps {
  epicDetails: EpicDetails;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStateChange: (e: { target: { name: string; value: unknown } }) => void;
}

const EpicDetailsEditor: React.FC<EpicDetailsEditorProps> = ({ 
  epicDetails, 
  onChange, 
  onStateChange 
}) => {
  const theme = useTheme();
  const shortcutApi = useShortcutApi();
  const [apiTokenAlert, setApiTokenAlert] = useState<boolean>(false);
  
  // Check if API token is available
  useEffect(() => {
    setApiTokenAlert(!shortcutApi.hasApiToken);
  }, [shortcutApi.hasApiToken]);
  
  // Handle epic state change
  const handleEpicStateChange = (state: ShortcutEpicState | null) => {
    if (state) {
      // Update the display name for backwards compatibility
      onStateChange({
        target: {
          name: 'state',
          value: state.name
        }
      });
      
      // Also update the epic_state_id for API use
      onStateChange({
        target: {
          name: 'epic_state_id',
          value: state.id
        }
      });
    } else {
      // Reset both values if no state is selected
      onStateChange({
        target: {
          name: 'state',
          value: ''
        }
      });
      
      onStateChange({
        target: {
          name: 'epic_state_id',
          value: undefined
        }
      });
    }
  };

  return (
    <CyberCard sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
        Epic
      </Typography>
      <CyberTextField
        fullWidth
        margin="normal"
        label="Epic Name"
        name="name"
        value={epicDetails.name}
        onChange={onChange}
        required
        helperText="You can use {{Variable}} syntax to define variables (e.g., '{{Feature}} Implementation')"
        cornerClip
      />
      <CyberTextField
        fullWidth
        margin="normal"
        label="Epic Description"
        name="description"
        value={epicDetails.description}
        onChange={onChange}
        multiline
        rows={3}
        helperText="You can use {{Variable}} syntax here too"
        cornerClip
      />
      
      {/* Epic State Selector */}
      {shortcutApi.hasApiToken ? (
        <Box sx={{ mt: 2 }}>
          <EpicStateSelector
            value={epicDetails.epic_state_id || null}
            onChange={handleEpicStateChange}
            fullWidth
          />
        </Box>
      ) : (
        // Fallback to current dropdown when API token isn't available
        <FormControl fullWidth margin="normal">
          <CyberSelect
            label="Default Epic State"
            name="state"
            value={epicDetails.state}
            onChange={onStateChange}
            cornerClip
          >
            <MenuItem value="to do">To Do</MenuItem>
            <MenuItem value="in progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </CyberSelect>
        </FormControl>
      )}
      
      {apiTokenAlert && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please set up your Shortcut API token in Settings to use real epic states.
        </Alert>
      )}
    </CyberCard>
  );
};

export default EpicDetailsEditor;

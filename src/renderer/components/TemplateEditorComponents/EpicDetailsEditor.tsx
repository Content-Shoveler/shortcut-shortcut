import React from 'react';
import {
  Typography,
  FormControl,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  CyberCard, 
  CyberTextField, 
  CyberSelect 
} from '../cyberpunk';
import { EpicDetails } from '../../types';

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

  return (
    <CyberCard sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Epic Details
      </Typography>
      <CyberTextField
        fullWidth
        margin="normal"
        label="Epic Name Template"
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
        label="Epic Description Template"
        name="description"
        value={epicDetails.description}
        onChange={onChange}
        multiline
        rows={3}
        helperText="You can use {{Variable}} syntax here too"
        cornerClip
      />
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
    </CyberCard>
  );
};

export default EpicDetailsEditor;

import React, { useState, useEffect, useMemo } from 'react';
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
  CyberSelect,
  CyberDatePicker,
  CyberMultiSelect,
  MultiSelectOption
} from '../cyberpunk';
import { EpicDetails } from '../../types';
import { 
  EpicStateSelector,
  MemberSelector, 
  LabelSelector, 
  ObjectiveSelector
} from '../ShortcutFields';
import { ShortcutEpicState } from '../../types/shortcutApi';
import { useShortcutApi } from '../../hooks/useShortcutApi';

// Helper components for the multi-select fields
interface LabelMultiSelectProps {
  value: any[];
  onChange: (selectedLabels: MultiSelectOption[]) => void;
  shortcutApi: ReturnType<typeof useShortcutApi>;
}

const LabelMultiSelect: React.FC<LabelMultiSelectProps> = ({ value, onChange, shortcutApi }) => {
  const [labels, setLabels] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load labels from the API
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setLoading(true);
        const labelData = await shortcutApi.fetchLabels();
        // Convert to MultiSelectOption format
        const options = labelData.map((label: any) => ({
          id: label.id,
          name: label.name,
          color: label.color
        }));
        setLabels(options);
      } catch (error) {
        console.error('Error fetching labels:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (shortcutApi.hasApiToken) {
      fetchLabels();
    }
  }, [shortcutApi]);
  
  // Convert current value to MultiSelectOption format
  const selectedLabels = useMemo(() => {
    if (!value) return [];
    return value.map((label: any) => ({
      id: label.id || label.name, // Use name as ID if ID is not available
      name: label.name,
      color: label.color
    }));
  }, [value]);
  
  if (loading) {
    return <Typography color="text.secondary">Loading labels...</Typography>;
  }
  
  return (
    <CyberMultiSelect
      options={labels}
      value={selectedLabels}
      onChange={onChange}
      placeholder="Select labels..."
      helperText="You can select multiple labels"
      cornerClip
      fullWidth
    />
  );
};

interface ObjectiveMultiSelectProps {
  value: any[];
  onChange: (selectedObjectives: MultiSelectOption[]) => void;
  shortcutApi: ReturnType<typeof useShortcutApi>;
}

const ObjectiveMultiSelect: React.FC<ObjectiveMultiSelectProps> = ({ value, onChange, shortcutApi }) => {
  const [objectives, setObjectives] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load objectives from the API
  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        setLoading(true);
        const objectiveData = await shortcutApi.fetchObjectives();
        // Convert to MultiSelectOption format
        const options = objectiveData.map((objective: any) => ({
          id: objective.id,
          name: objective.name
        }));
        setObjectives(options);
      } catch (error) {
        console.error('Error fetching objectives:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (shortcutApi.hasApiToken) {
      fetchObjectives();
    }
  }, [shortcutApi]);
  
  // Convert current value to MultiSelectOption format by finding the matching objectives
  const selectedObjectives = useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) return [];
    
    return value
      .map((id: number | string) => {
        const objective = objectives.find(obj => obj.id === id);
        return objective ? objective : null;
      })
      .filter((obj): obj is MultiSelectOption => obj !== null);
  }, [value, objectives]);
  
  if (loading) {
    return <Typography color="text.secondary">Loading objectives...</Typography>;
  }
  
  return (
    <CyberMultiSelect
      options={objectives}
      value={selectedObjectives}
      onChange={onChange}
      placeholder="Select objectives..."
      helperText="You can select multiple objectives"
      cornerClip
      fullWidth
    />
  );
};

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
  
  // Handle owner selection
  const handleOwnerChange = (member: any | null) => {
    // Store the ID in owner_ids array
    const ownerIds = member ? [member.id] : [];
    
    onStateChange({
      target: {
        name: 'owner_ids',
        value: ownerIds
      }
    });
  };
  
  // Handle date changes
  const handleDateChange = (name: string, value: string) => {
    onStateChange({
      target: {
        name,
        value
      }
    });
  };
  
  // Handle multiple label selection
  const handleLabelsChange = (selectedLabels: MultiSelectOption[]) => {
    // Map selected options to label objects with name and color
    const labels = selectedLabels.map(label => ({
      name: label.name,
      color: label.color
    }));
    
    onStateChange({
      target: {
        name: 'labels',
        value: labels
      }
    });
  };
  
  // Handle multiple objective selection
  const handleObjectivesChange = (selectedObjectives: MultiSelectOption[]) => {
    // Extract IDs from the selected objectives
    const objectiveIds = selectedObjectives.map(obj => obj.id);
    
    onStateChange({
      target: {
        name: 'objective_ids',
        value: objectiveIds
      }
    });
  };
  
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
      
      {/* Date Picker Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
          Timeline
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <CyberDatePicker
            label="Start Date"
            value={epicDetails.planned_start_date || ''}
            onChange={(date) => handleDateChange('planned_start_date', date)}
            helperText="You can use {{Variable}} syntax here"
            fullWidth
            cornerClip
          />
          <CyberDatePicker
            label="End Date (Deadline)"
            value={epicDetails.deadline || ''}
            onChange={(date) => handleDateChange('deadline', date)}
            helperText="You can use {{Variable}} syntax here"
            fullWidth
            cornerClip
          />
        </Box>
      </Box>
      
      {/* API-based selectors - only show when API token is available */}
      {shortcutApi.hasApiToken && (
        <>
          {/* Owner selector */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Assignment
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Select an owner for the epic
              </Typography>
            </Box>
            <MemberSelector
              value={epicDetails.owner_ids?.[0] || null}
              onChange={handleOwnerChange}
              fullWidth
            />
          </Box>

          {/* Multi-select Label selector */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Labels
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Categorize your epic with one or more labels
              </Typography>
            </Box>
            {shortcutApi.hasApiToken && (
              <LabelMultiSelect
                value={epicDetails.labels || []}
                onChange={handleLabelsChange}
                shortcutApi={shortcutApi}
              />
            )}
          </Box>

          {/* Multi-select Objective selector */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Objectives
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Link this epic to one or more company objectives
              </Typography>
            </Box>
            {shortcutApi.hasApiToken && (
              <ObjectiveMultiSelect
                value={epicDetails.objective_ids || []}
                onChange={handleObjectivesChange}
                shortcutApi={shortcutApi}
              />
            )}
          </Box>
        </>
      )}
      
      {apiTokenAlert && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please set up your Shortcut API token in Settings to use real epic states, owners, labels, and objectives.
        </Alert>
      )}
    </CyberCard>
  );
};

export default EpicDetailsEditor;

import React, { useCallback, useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Box,
  Typography,
  Alert,
  MenuItem,
  Chip,
  alpha,
  useTheme,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  CyberTextField, 
  CyberButton, 
  CyberSelect, 
  CyberIcon 
} from '../cyberpunk';
import { StoryTemplate } from '../../types';
import { ShortcutWorkflow, ShortcutWorkflowState } from '../../types/shortcutApi';
import { useShortcutApi } from '../../hooks/useShortcutApi';

// Story state options
const storyTypeOptions = [
  'feature',
  'bug',
  'chore',
];

interface StoryEditorProps {
  open: boolean;
  onClose: () => void;
  currentStory: StoryTemplate | null;
  onSave: (story: StoryTemplate) => void;
}

const StoryEditor: React.FC<StoryEditorProps> = ({
  open,
  onClose,
  currentStory,
  onSave,
}) => {
  const theme = useTheme();
  const shortcutApi = useShortcutApi();
  
  // Workflows and states for story creation
  const [workflows, setWorkflows] = useState<ShortcutWorkflow[]>([]);
  const [workflowStates, setWorkflowStates] = useState<ShortcutWorkflowState[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [loadingWorkflows, setLoadingWorkflows] = useState<boolean>(false);
  const [loadingWorkflowStates, setLoadingWorkflowStates] = useState<boolean>(false);
  const [apiTokenAlert, setApiTokenAlert] = useState<boolean>(false);
  const [story, setStory] = useState<StoryTemplate | null>(null);
  
  // Initialize story state when the dialog opens with a currentStory
  useEffect(() => {
    if (open && currentStory) {
      setStory(currentStory);
      
      // Set selected workflow if it exists in the story
      if (currentStory.workflow_id) {
        setSelectedWorkflow(currentStory.workflow_id);
      }
    }
  }, [open, currentStory]);
  
  // Fetch workflows when dialog opens
  useEffect(() => {
    if (open) {
      fetchWorkflows();
    }
  }, [open]);
  
  // Fetch workflow states when a workflow is selected
  useEffect(() => {
    if (selectedWorkflow) {
      fetchWorkflowStates(selectedWorkflow);
    } else {
      setWorkflowStates([]);
    }
  }, [selectedWorkflow]);
  
  const fetchWorkflows = useCallback(async () => {
    if (!shortcutApi.hasApiToken) {
      setApiTokenAlert(true);
      return;
    }
    
    setApiTokenAlert(false);
    setLoadingWorkflows(true);
    
    try {
      const fetchedWorkflows = await shortcutApi.fetchWorkflows();
      setWorkflows(fetchedWorkflows);
      
      // Reset selected workflow and states when workflows change
      setSelectedWorkflow('');
      setWorkflowStates([]);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoadingWorkflows(false);
    }
  }, [shortcutApi]);
  
  const fetchWorkflowStates = useCallback(async (workflowId: string) => {
    if (!shortcutApi.hasApiToken || !workflowId) {
      return;
    }
    
    setLoadingWorkflowStates(true);
    
    try {
      const fetchedStates = await shortcutApi.fetchWorkflowStates(workflowId);
      setWorkflowStates(fetchedStates);
    } catch (error) {
      console.error('Failed to fetch workflow states:', error);
      setWorkflowStates([]);
    } finally {
      setLoadingWorkflowStates(false);
    }
  }, [shortcutApi]);
  
  const handleStoryChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    if (story) {
      setStory({
        ...story,
        [name]: value,
      });
    }
  };
  
  const handleWorkflowChange = (event: SelectChangeEvent<unknown>) => {
    const workflowId = event.target.value as string;
    
    // Update component state
    setSelectedWorkflow(workflowId);
    
    // Update the current story
    if (story) {
      setStory({
        ...story,
        workflow_id: workflowId,
        // Reset workflow state when workflow changes
        workflow_state_id: '',
      });
    }
  };
  
  const handleWorkflowStateChange = (event: SelectChangeEvent<unknown>) => {
    const stateId = event.target.value as string;
    
    if (story) {
      // Find the state name for display
      const stateName = workflowStates.find(state => state.id.toString() === stateId)?.name || '';
      
      setStory({
        ...story,
        workflow_state_id: stateId,
        state: stateName, // Store the name for display purposes
      });
    }
  };
  
  const handleStoryEstimateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (story && !isNaN(value)) {
      setStory({
        ...story,
        estimate: value,
      });
    }
  };
  
  const handleSave = () => {
    if (story) {
      onSave(story);
      onClose();
    }
  };
  
  if (!story) {
    return null;
  }
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: theme.palette.mode === 'dark' ? `0 0 15px ${alpha(theme.palette.secondary.main, 0.3)}` : '0 4px 20px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: '60%',
          background: theme.palette.secondary.main,
          opacity: 0.8,
        }
      }}>
        {story.name ? `Edit Story: ${story.name}` : 'Add Story'}
      </DialogTitle>
      <DialogContent>
        <CyberTextField
          fullWidth
          margin="normal"
          label="Story Name"
          name="name"
          value={story.name}
          onChange={handleStoryChange}
          required
          helperText="You can use {{Variable}} syntax (e.g., 'Implement {{Feature}} UI')"
          cornerClip
        />
        <CyberTextField
          fullWidth
          margin="normal"
          label="Story Description"
          name="description"
          value={story.description}
          onChange={handleStoryChange}
          multiline
          rows={3}
          helperText="You can use {{Variable}} syntax here too"
          cornerClip
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <FormControl fullWidth margin="normal">
            <CyberSelect
              label="Story Type"
              name="type"
              value={story.type}
              onChange={handleStoryChange}
              cornerClip
            >
              {storyTypeOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </CyberSelect>
          </FormControl>
          
          <CyberTextField
            fullWidth
            margin="normal"
            label="Estimate (Points)"
            type="number"
            value={story.estimate || 0}
            onChange={handleStoryEstimateChange}
            inputProps={{ min: 0, max: 100 }}
            cornerClip
          />
        </Box>
        
        {/* Workflow and State Selectors */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <FormControl fullWidth margin="normal">
            <CyberSelect
              label="Workflow"
              value={selectedWorkflow}
              onChange={handleWorkflowChange}
              cornerClip
              disabled={loadingWorkflows}
            >
              {loadingWorkflows ? (
                <MenuItem value="">Loading workflows...</MenuItem>
              ) : workflows.length > 0 ? (
                workflows.map(workflow => (
                  <MenuItem key={workflow.id} value={workflow.id.toString()}>
                    {workflow.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">No workflows found</MenuItem>
              )}
            </CyberSelect>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <CyberSelect
              label="State"
              value={story.workflow_state_id || ''}
              onChange={handleWorkflowStateChange}
              cornerClip
              disabled={!selectedWorkflow || loadingWorkflowStates}
            >
              {loadingWorkflowStates ? (
                <MenuItem value="">Loading states...</MenuItem>
              ) : workflowStates.length > 0 ? (
                workflowStates.map(state => (
                  <MenuItem key={state.id} value={state.id.toString()}>
                    {state.name}
                  </MenuItem>
                ))
              ) : selectedWorkflow ? (
                <MenuItem value="">No states found for this workflow</MenuItem>
              ) : (
                <MenuItem value="">Select a workflow first</MenuItem>
              )}
            </CyberSelect>
          </FormControl>
        </Box>
        
        {apiTokenAlert && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Please set up your Shortcut API token in Settings to use the workflow features.
          </Alert>
        )}
        
        <Accordion sx={{ 
          mt: 2,
          backgroundImage: 'none',
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          '&::before': {
            display: 'none',
          }
        }}>
          <AccordionSummary 
            expandIcon={<CyberIcon icon={ExpandMoreIcon} size={20} />}
            sx={{
              '&.Mui-expanded': {
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            <Typography>Labels (Optional)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CyberTextField
              fullWidth
              label="Add Labels (comma separated)"
              placeholder="e.g., frontend, backend, design, urgent"
              value={story.labels?.join(', ') || ''}
              onChange={(e) => {
                const labelValue = e.target.value;
                const labels = labelValue
                  .split(',')
                  .map(label => label.trim())
                  .filter(label => label !== '');
                
                setStory({
                  ...story,
                  labels,
                });
              }}
              cornerClip
            />
            {story.labels && story.labels.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {story.labels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    onDelete={() => {
                      setStory({
                        ...story,
                        labels: story.labels?.filter(l => l !== label) || [],
                      });
                    }}
                    sx={{ 
                      borderRadius: '4px',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  />
                ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <CyberButton onClick={onClose}>
          Cancel
        </CyberButton>
        <CyberButton 
          onClick={handleSave}
          variant="contained"
          disabled={!story.name}
          glowIntensity={0.7}
          sx={{ 
            backgroundColor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.primary.main, 0.8)
              : theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.secondary.main, 0.8)
                : theme.palette.primary.dark,
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'dark'
                ? `0 0 12px ${alpha(theme.palette.secondary.main, 0.7)}`
                : `0 4px 8px ${alpha(theme.palette.primary.main, 0.4)}`
            },
            '&.Mui-disabled': {
              backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.action.disabled, 0.4)
                : alpha(theme.palette.action.disabled, 0.7),
              color: theme.palette.text.disabled
            }
          }}
        >
          Save
        </CyberButton>
      </DialogActions>
    </Dialog>
  );
};

export default StoryEditor;

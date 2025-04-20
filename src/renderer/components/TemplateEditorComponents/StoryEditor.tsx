import React, { useState, useEffect } from 'react';
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
  alpha,
  useTheme,
} from '@mui/material';
import { 
  CyberTextField, 
  CyberButton, 
  CyberSelect, 
  CyberIcon 
} from '../cyberpunk';
import { StoryTemplate } from '../../types';
import { ShortcutWorkflow, ShortcutWorkflowState, ShortcutMember, ShortcutIteration } from '../../types/shortcutApi';
import { useShortcutApi } from '../../hooks/useShortcutApi';
import { WorkflowAndStateSelector, MemberSelector, IterationSelector } from '../ShortcutFields';

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
  const [apiTokenAlert, setApiTokenAlert] = useState<boolean>(false);
  const [story, setStory] = useState<StoryTemplate | null>(null);
  
  // Initialize story state when the dialog opens with a currentStory
  useEffect(() => {
    if (open && currentStory) {
      setStory(currentStory);
    }
  }, [open, currentStory]);
  
  // Check if API token is available
  useEffect(() => {
    if (open) {
      setApiTokenAlert(!shortcutApi.hasApiToken);
    }
  }, [open, shortcutApi.hasApiToken]);
  
  const handleStoryChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    if (story) {
      setStory({
        ...story,
        [name]: value,
      });
    }
  };
  
  // Handle workflow change
  const handleWorkflowChange = (workflow: ShortcutWorkflow | null) => {
    if (story) {
      setStory({
        ...story,
        workflow_id: workflow ? workflow.id.toString() : '',
        // Reset workflow state when workflow changes
        workflow_state_id: '',
        state: '',
      });
    }
  };
  
  // Handle workflow state change
  const handleWorkflowStateChange = (state: ShortcutWorkflowState | null) => {
    if (story) {
      setStory({
        ...story,
        workflow_state_id: state ? state.id.toString() : '',
        state: state ? state.name : '', // Store the name for display purposes
      });
    }
  };
  
  // Handle owner change
  const handleOwnerChange = (member: ShortcutMember | null) => {
    if (story) {
      // If the owner is selected, add their ID to the owner_ids array
      // If not, set to empty array
      const ownerIds = member ? [member.id.toString()] : [];
      
      setStory({
        ...story,
        owner_ids: ownerIds,
      });
    }
  };
  
  // Handle iteration change
  const handleIterationChange = (iteration: ShortcutIteration | null) => {
    if (story) {
      setStory({
        ...story,
        iteration_id: iteration ? iteration.id.toString() : undefined,
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
        <Box sx={{ mt: 2 }}>
          <WorkflowAndStateSelector 
            // Just pass the IDs - the component will resolve them
            parentValue={story.workflow_id ? Number(story.workflow_id) : null}
            childValue={story.workflow_state_id ? Number(story.workflow_state_id) : null}
            onParentChange={handleWorkflowChange}
            onChildChange={handleWorkflowStateChange}
            disabled={!shortcutApi.hasApiToken}
            fullWidth
          />
        </Box>
        
        {/* Owner and Iteration Selectors */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Owner
            </Typography>
            <MemberSelector
              value={story.owner_ids && story.owner_ids.length > 0 ? story.owner_ids[0] : null}
              onChange={handleOwnerChange}
              disabled={!shortcutApi.hasApiToken}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Assign a primary owner to this story
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Iteration
            </Typography>
            <IterationSelector
              value={story.iteration_id ? Number(story.iteration_id) : null}
              onChange={handleIterationChange}
              disabled={!shortcutApi.hasApiToken}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Assign to an iteration/sprint
            </Typography>
          </Box>
        </Box>
        
        {apiTokenAlert && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Please set up your Shortcut API token in Settings to use the workflow features.
          </Alert>
        )}
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

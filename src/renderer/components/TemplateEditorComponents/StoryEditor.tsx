import React, { useState, useEffect, useMemo } from 'react';
import { TaskManager } from './TaskComponents';
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
  CyberIcon,
  CyberMultiSelect,
  MultiSelectOption
} from '../cyberpunk';
import { StoryTemplate, TaskTemplate } from '../../types';
import { ShortcutWorkflow, ShortcutWorkflowState, ShortcutMember, ShortcutIteration } from '../../types/shortcutApi';
import { useShortcutApi } from '../../hooks/useShortcutApi';
import { WorkflowAndStateSelector, MemberSelector, IterationSelector, EstimateScaleSelector, GroupSelector } from '../ShortcutFields';

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
      // Initialize with empty tasks array if not defined
      setStory({
        ...currentStory,
        tasks: currentStory.tasks || []
      });
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
  
  // Helper component for multi-select member field
  const MemberMultiSelect: React.FC<{
    value: any[];
    onChange: (selectedMembers: MultiSelectOption[]) => void;
    disabled?: boolean;
    fullWidth?: boolean;
  }> = ({ value, onChange, disabled, fullWidth }) => {
    const [members, setMembers] = useState<MultiSelectOption[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Load members from the API
    useEffect(() => {
      const fetchMembers = async () => {
        try {
          setLoading(true);
          const memberData = await shortcutApi.fetchMembers();
          // Convert to MultiSelectOption format
          const options = memberData.map((member: any) => ({
            id: member.id,
            name: member.profile ? member.profile.name : `Member ${member.id}`,
          }));
          setMembers(options);
        } catch (error) {
          console.error('Error fetching members:', error);
        } finally {
          setLoading(false);
        }
      };
      
      if (shortcutApi.hasApiToken) {
        fetchMembers();
      }
    }, []);
    
    // Convert current value to MultiSelectOption format
    const selectedMembers = useMemo(() => {
      if (!value || !Array.isArray(value) || value.length === 0) return [];
      
      return value
        .map((id: string) => {
          const member = members.find(mem => mem.id === id);
          return member ? member : null;
        })
        .filter((mem): mem is MultiSelectOption => mem !== null);
    }, [value, members]);
    
    if (loading) {
      return <Typography color="text.secondary">Loading members...</Typography>;
    }
    
    return (
      <CyberMultiSelect
        options={members}
        value={selectedMembers}
        onChange={onChange}
        placeholder="Select owners..."
        helperText="You can select multiple owners"
        cornerClip
        fullWidth={fullWidth}
        disabled={disabled}
      />
    );
  };
  
  // Handle owner change
  const handleOwnerChange = (selectedMembers: MultiSelectOption[]) => {
    if (story) {
      // Extract IDs from the selected members and convert to strings
      const ownerIds = selectedMembers.map(member => member.id.toString());
      
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
  
  // Handle team (group) change
  const handleGroupChange = (group: any | null) => {
    if (story) {
      setStory({
        ...story,
        group_id: group ? group.id.toString() : undefined,
      });
    }
  };
  
  // Custom component for group/team selection
  const GroupSingleSelect: React.FC<{
    value: string | null | number;
    onChange: (selectedGroup: any | null) => void;
    disabled?: boolean;
    fullWidth?: boolean;
  }> = ({ value, onChange, disabled, fullWidth }) => {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Load groups from the API
    useEffect(() => {
      const fetchGroups = async () => {
        try {
          setLoading(true);
          const groupData = await shortcutApi.fetchGroups();
          setGroups(groupData);
        } catch (error) {
          console.error('Error fetching groups:', error);
        } finally {
          setLoading(false);
        }
      };
      
      if (shortcutApi.hasApiToken) {
        fetchGroups();
      }
    }, []);
    
    // Find the currently selected group if we have a value
    const selectedGroup = useMemo(() => {
      if (!value || groups.length === 0) return null;
      
      const groupId = typeof value === 'string' ? value : value.toString();
      return groups.find(group => group.id.toString() === groupId) || null;
    }, [value, groups]);
    
    if (loading) {
      return <Typography color="text.secondary">Loading teams...</Typography>;
    }
    
    return (
      <FormControl fullWidth={fullWidth}>
        <CyberSelect
          label="Team"
          value={selectedGroup ? selectedGroup.id.toString() : ''}
          onChange={(e) => {
            const id = e.target.value;
            if (!id) {
              onChange(null);
              return;
            }
            const group = groups.find(g => g.id.toString() === id);
            onChange(group || null);
          }}
          disabled={disabled}
          helperText="Assign a team to this story"
          cornerClip
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id.toString()}>
              {group.name}
            </MenuItem>
          ))}
        </CyberSelect>
      </FormControl>
    );
  };
  
  // Handle estimate scale selection
  const handleEstimateChange = (estimateOption: any) => {
    if (story && estimateOption) {
      setStory({
        ...story,
        estimate: estimateOption.value,
      });
    } else if (story) {
      // Handle when estimate is cleared
      setStory({
        ...story,
        estimate: undefined,
      });
    }
  };
  
  // Handle task changes
  const handleTasksChange = (tasks: TaskTemplate[]) => {
    if (story) {
      setStory({
        ...story,
        tasks
      });
    }
  };
  
  // Auto-save on dialog close
  const handleClose = () => {
    if (story && story.name) {
      onSave(story);
    }
    onClose();
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
        
        {/* Story Type and Estimate Selectors */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <CyberSelect
              fullWidth
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
            
            <EstimateScaleSelector
              value={story.estimate !== undefined ? Number(story.estimate) : null}
              onChange={handleEstimateChange}
              disabled={!shortcutApi.hasApiToken}
              fullWidth
            />
          </Box>
        </Box>
        
        {/* Workflow and State Selectors */}
        <Box sx={{ mt: 2, mb: 2 }}>
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
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 2 }}>
          <Box sx={{ flex: 1 }}>
            <MemberMultiSelect
              value={story.owner_ids || []}
              onChange={handleOwnerChange}
              disabled={!shortcutApi.hasApiToken}
              fullWidth
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <IterationSelector
              value={story.iteration_id ? Number(story.iteration_id) : null}
              onChange={handleIterationChange}
              disabled={!shortcutApi.hasApiToken}
              fullWidth
            />
          </Box>
        </Box>
        
        {/* Team Selector */}
        <Box sx={{ mt: 2 }}>
          <GroupSingleSelect
            value={story.group_id || null}
            onChange={handleGroupChange}
            disabled={!shortcutApi.hasApiToken}
            fullWidth
          />
        </Box>
        
        {apiTokenAlert && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Please set up your Shortcut API token in Settings to use the workflow features.
          </Alert>
        )}
        
        {/* Task Management Section */}
        <TaskManager
          tasks={story.tasks || []}
          onChange={handleTasksChange}
          disabled={!shortcutApi.hasApiToken}
        />
      </DialogContent>
      <DialogActions>
        <CyberButton 
          onClick={handleClose}
          variant="contained"
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
            }
          }}
        >
          Back
        </CyberButton>
      </DialogActions>
    </Dialog>
  );
};

export default StoryEditor;

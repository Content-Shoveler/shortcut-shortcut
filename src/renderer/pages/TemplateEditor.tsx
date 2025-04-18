import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { v4 as uuidv4 } from 'uuid';
import { 
  CyberCard, 
  CyberTextField, 
  CyberButton, 
  CyberSelect, 
  CyberIcon 
} from '../components/cyberpunk';

import { Template, StoryTemplate, EpicDetails } from '../types';
import { useShortcutApi } from '../hooks/useShortcutApi';
import { ShortcutWorkflow, ShortcutWorkflowState } from '../types/shortcutApi';

// Function to extract variables from a text string
const extractVariables = (text: string): string[] => {
  const matches = text.match(/{{(.*?)}}/g) || [];
  return matches.map(match => match.replace('{{', '').replace('}}', ''))
    .filter((value, index, self) => self.indexOf(value) === index);
};

// Story state options
const storyStateOptions = [
  'Unstarted',
  'Ready for Development',
  'In Development',
  'Ready for Review',
  'Completed',
];

// Story type options
const storyTypeOptions = [
  'feature',
  'bug',
  'chore',
];

const TemplateEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const shortcutApi = useShortcutApi();
  
  // Workflows and states for story creation
  const [workflows, setWorkflows] = useState<ShortcutWorkflow[]>([]);
  const [workflowStates, setWorkflowStates] = useState<ShortcutWorkflowState[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [loadingWorkflows, setLoadingWorkflows] = useState<boolean>(false);
  const [loadingWorkflowStates, setLoadingWorkflowStates] = useState<boolean>(false);
  
  const [template, setTemplate] = useState<Template>({
    id: id || uuidv4(),
    name: '',
    description: '',
    epicDetails: {
      name: '',
      description: '',
      state: 'to do',
    },
    storyTemplates: [],
    variables: [],
  });
  
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryTemplate | null>(null);
  const [editingStoryIndex, setEditingStoryIndex] = useState<number | null>(null);
  const [apiTokenAlert, setApiTokenAlert] = useState<boolean>(false);
  const [newVariable, setNewVariable] = useState('');
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);

  // Fetch workflows when dialog opens
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
      setAlert({
        type: 'error',
        message: 'Failed to fetch workflows. Make sure your API token is valid.'
      });
    } finally {
      setLoadingWorkflows(false);
    }
  }, [shortcutApi]);
  
  // Use a ref to track loading status and the last fetched workflow ID to avoid loops
  const isLoadingWorkflowStatesRef = useRef(false);
  const lastFetchedWorkflowIdRef = useRef<string | null>(null);
  
  // Directly fetch workflow states (not as a useCallback to avoid dependency issues)
  const fetchWorkflowStates = async (workflowId: string) => {
    // Skip if no token, no ID, already loading, or already fetched this ID
    if (!shortcutApi.hasApiToken || !workflowId) {
      console.log('Cannot fetch workflow states: No API token or workflow ID');
      return;
    }
    
    if (isLoadingWorkflowStatesRef.current) {
      console.log('Already loading workflow states, skipping duplicate request');
      return;
    }
    
    // Update ref tracking and loading state
    isLoadingWorkflowStatesRef.current = true;
    setLoadingWorkflowStates(true);
    
    console.log(`Fetching states for workflow ID: ${workflowId}`);
    
    try {
      const fetchedStates = await shortcutApi.fetchWorkflowStates(workflowId);
      
      console.log('API response for workflow states:', fetchedStates);
      
      // Only update state if the selected workflow hasn't changed while fetching
      if (selectedWorkflow === workflowId) {
        setWorkflowStates(fetchedStates);
        lastFetchedWorkflowIdRef.current = workflowId;
        console.log(`Loaded ${fetchedStates.length} workflow states successfully`);
        
        if (fetchedStates.length === 0) {
          console.warn('Workflow returned zero states');
        }
      }
    } catch (error) {
      console.error('Failed to fetch workflow states:', error);
      setAlert({
        type: 'error',
        message: 'Failed to fetch workflow states - please try a different workflow'
      });
    } finally {
      isLoadingWorkflowStatesRef.current = false;
      setLoadingWorkflowStates(false);
    }
  };
  
  // Load template if ID is provided
  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        try {
          const templates = await window.electronAPI.getTemplates();
          const foundTemplate = templates.find((t: Template) => t.id === id);
          
          if (foundTemplate) {
            setTemplate(foundTemplate);
          } else {
            setAlert({
              type: 'error',
              message: 'Template not found',
            });
            navigate('/');
          }
        } catch (error) {
          setAlert({
            type: 'error',
            message: 'Failed to load template',
          });
        }
      }
    };

    loadTemplate();
  }, [id, navigate]);

  // Update variables whenever epic or story details change
  useEffect(() => {
    const epicVariables = extractVariables(template.epicDetails.name + template.epicDetails.description);
    
    const storyVariables = template.storyTemplates.flatMap(story => 
      extractVariables(story.name + story.description)
    );
    
    const allVariables = [...epicVariables, ...storyVariables]
      .filter((value, index, self) => self.indexOf(value) === index);
    
    setTemplate(prev => ({
      ...prev,
      variables: allVariables,
    }));
  }, [template.epicDetails, template.storyTemplates]);

  // Input change handlers
  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEpicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({
      ...prev,
      epicDetails: {
        ...prev.epicDetails,
        [name]: value,
      },
    }));
  };

  // Story dialog handlers
  const openNewStoryDialog = () => {
    setCurrentStory({
      name: '',
      description: '',
      type: 'feature',
      state: 'Ready for Development',
      workflow_id: '',
      workflow_state_id: '',
      estimate: 0,
      labels: [],
    });
    setEditingStoryIndex(null);
    setStoryDialogOpen(true);
    
    // Fetch workflows when dialog opens
    fetchWorkflows();
    
    // Reset selected workflow
    setSelectedWorkflow('');
  };

  const openEditStoryDialog = (index: number) => {
    const story = { ...template.storyTemplates[index] };
    setCurrentStory(story);
    setEditingStoryIndex(index);
    setStoryDialogOpen(true);
    
    // Fetch workflows when dialog opens
    fetchWorkflows();
    
    // Set selected workflow if it exists in the story
    if (story.workflow_id) {
      setSelectedWorkflow(story.workflow_id);
    }
  };

  const handleStoryChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    if (currentStory) {
      setCurrentStory({
        ...currentStory,
        [name]: value,
      } as StoryTemplate);
    }
  };
  
  // Handle workflow selection - fetch states directly on change
  const handleWorkflowChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    const workflowId = event.target.value as string;
    
    // Update component state
    setSelectedWorkflow(workflowId);
    
    // Reset workflow states when workflow changes
    if (!workflowId) {
      setWorkflowStates([]);
      lastFetchedWorkflowIdRef.current = null;
    } else {
      // Directly fetch states instead of relying on useEffect
      fetchWorkflowStates(workflowId);
    }
    
    // Update the current story
    if (currentStory) {
      setCurrentStory({
        ...currentStory,
        workflow_id: workflowId,
        // Reset workflow state when workflow changes
        workflow_state_id: '',
      });
    }
  };
  
  // Handle workflow state selection
  const handleWorkflowStateChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    const stateId = event.target.value as string;
    
    if (currentStory) {
      // Find the state name for display
      const stateName = workflowStates.find(state => state.id.toString() === stateId)?.name || '';
      
      setCurrentStory({
        ...currentStory,
        workflow_state_id: stateId,
        state: stateName, // Store the name for display purposes
      });
    }
  };

  const handleStoryEstimateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (currentStory && !isNaN(value)) {
      setCurrentStory({
        ...currentStory,
        estimate: value,
      });
    }
  };

  const handleSaveStory = () => {
    if (currentStory) {
      const updatedStories = [...template.storyTemplates];
      
      if (editingStoryIndex !== null) {
        updatedStories[editingStoryIndex] = currentStory;
      } else {
        updatedStories.push(currentStory);
      }
      
      setTemplate(prev => ({
        ...prev,
        storyTemplates: updatedStories,
      }));
      
      setStoryDialogOpen(false);
      setCurrentStory(null);
      setEditingStoryIndex(null);
    }
  };

  const handleDeleteStory = (index: number) => {
    const updatedStories = [...template.storyTemplates];
    updatedStories.splice(index, 1);
    
    setTemplate(prev => ({
      ...prev,
      storyTemplates: updatedStories,
    }));
  };

  // Variables handlers
  const handleAddVariable = () => {
    if (newVariable.trim() !== '' && !template.variables.includes(newVariable.trim())) {
      setTemplate(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()],
      }));
      setNewVariable('');
      setVariableDialogOpen(false);
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable),
    }));
  };

  // Save template
  const handleSaveTemplate = async () => {
    try {
      await window.electronAPI.saveTemplate(template);
      
      setAlert({
        type: 'success',
        message: 'Template saved successfully',
      });
      
      // Navigate back to template list if this is a new template
      if (!id) {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to save template',
      });
    }
  };

  return (
    <Box>
      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {id ? 'Edit Template' : 'Create Template'}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <CyberButton 
            variant="outlined" 
            startIcon={<CyberIcon icon={ArrowBackIcon} size={20} />}
            onClick={() => navigate('/')}
            scanlineEffect
          >
            Cancel
          </CyberButton>
          <CyberButton 
            variant="contained"
            startIcon={<CyberIcon icon={SaveIcon} size={20} />}
            onClick={handleSaveTemplate}
            disabled={!template.name || !template.epicDetails.name}
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
            Save Template
          </CyberButton>
        </Stack>
      </Box>

      <CyberCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Template Details
        </Typography>
        <CyberTextField
          fullWidth
          margin="normal"
          label="Template Name"
          name="name"
          value={template.name}
          onChange={handleTemplateChange}
          required
          cornerClip
        />
        <CyberTextField
          fullWidth
          margin="normal"
          label="Template Description"
          name="description"
          value={template.description}
          onChange={handleTemplateChange}
          multiline
          rows={2}
          cornerClip
        />
      </CyberCard>

      <CyberCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Epic Details
        </Typography>
        <CyberTextField
          fullWidth
          margin="normal"
          label="Epic Name Template"
          name="name"
          value={template.epicDetails.name}
          onChange={handleEpicChange}
          required
          helperText="You can use {{Variable}} syntax to define variables (e.g., '{{Feature}} Implementation')"
          cornerClip
        />
        <CyberTextField
          fullWidth
          margin="normal"
          label="Epic Description Template"
          name="description"
          value={template.epicDetails.description}
          onChange={handleEpicChange}
          multiline
          rows={3}
          helperText="You can use {{Variable}} syntax here too"
          cornerClip
        />
        <FormControl fullWidth margin="normal">
          <CyberSelect
            label="Default Epic State"
            name="state"
            value={template.epicDetails.state}
            onChange={(e) => {
              const { name, value } = e.target;
              setTemplate(prev => ({
                ...prev,
                epicDetails: {
                  ...prev.epicDetails,
                  [name]: value as string,
                },
              }));
            }}
            cornerClip
          >
            <MenuItem value="to do">To Do</MenuItem>
            <MenuItem value="in progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </CyberSelect>
        </FormControl>
      </CyberCard>

      <CyberCard sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Story Templates ({template.storyTemplates.length})
          </Typography>
          <CyberButton 
            variant="outlined" 
            startIcon={<CyberIcon icon={AddIcon} size={20} />}
            onClick={openNewStoryDialog}
            scanlineEffect
          >
            Add Story
          </CyberButton>
        </Box>

        {template.storyTemplates.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No stories added yet. Click "Add Story" to create your first story template.
          </Typography>
        ) : (
          <List>
            {template.storyTemplates.map((story, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDeleteStory(index)}>
                      <CyberIcon icon={DeleteIcon} size={20} />
                    </IconButton>
                  }
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    borderRadius: '2px',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    }
                  }}
                  onClick={() => openEditStoryDialog(index)}
                >
                  <ListItemText
                    primary={story.name || '(Unnamed Story)'}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {story.type} • {story.state} {story.estimate ? `• ${story.estimate} points` : ''}
                        </Typography>
                        {story.description && (
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {story.description.length > 100
                              ? `${story.description.substring(0, 100)}...`
                              : story.description}
                          </Typography>
                        )}
                        {story.labels && story.labels.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {story.labels.map(label => (
                              <Chip
                                key={label}
                                label={label}
                                size="small"
                                sx={{ 
                                  mr: 0.5, 
                                  mb: 0.5,
                                  borderRadius: '4px',
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CyberCard>

      <CyberCard sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Variables ({template.variables.length})
          </Typography>
          <CyberButton 
            variant="outlined" 
            startIcon={<CyberIcon icon={AddIcon} size={20} />}
            onClick={() => setVariableDialogOpen(true)}
            scanlineEffect
          >
            Add Variable
          </CyberButton>
        </Box>

        {template.variables.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No variables detected. Add variables using the {"{{Variable}}"} syntax in your templates.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {template.variables.map((variable) => (
              <Chip
                key={variable}
                label={variable}
                onDelete={() => handleRemoveVariable(variable)}
                color="primary"
                variant="outlined"
                sx={{ 
                  borderRadius: '4px',
                  fontFamily: "'Share Tech Mono', monospace",
                }}
              />
            ))}
          </Box>
        )}
      </CyberCard>

      {/* Story Dialog */}
      <Dialog
        open={storyDialogOpen}
        onClose={() => setStoryDialogOpen(false)}
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
          {editingStoryIndex !== null ? 'Edit Story' : 'Add Story'}
        </DialogTitle>
        <DialogContent>
          <CyberTextField
            fullWidth
            margin="normal"
            label="Story Name"
            name="name"
            value={currentStory?.name || ''}
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
            value={currentStory?.description || ''}
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
                value={currentStory?.type || 'feature'}
                onChange={handleStoryChange}
                cornerClip
              >
                {storyTypeOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </CyberSelect>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <CyberSelect
                label="Display State Name"
                name="state"
                value={currentStory?.state || 'Ready for Development'}
                onChange={handleStoryChange}
                cornerClip
                helperText="This is used for display purposes in the template"
              >
                {storyStateOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </CyberSelect>
            </FormControl>
            
            <CyberTextField
              fullWidth
              margin="normal"
              label="Estimate (Points)"
              type="number"
              value={currentStory?.estimate || 0}
              onChange={handleStoryEstimateChange}
              inputProps={{ min: 0, max: 100 }}
              cornerClip
            />
          </Box>
          
          {/* Shortcut Workflow and State Selectors */}
          <CyberCard sx={{ p: 2, mt: 2, mb: 1 }} title="Shortcut API Integration" cornerAccent glowOnHover>
            {apiTokenAlert ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please set up your Shortcut API token in Settings to use this feature.
              </Alert>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Select Workflow and State for Shortcut
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This will determine where stories are created in Shortcut when applying the template.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <CyberSelect
                      label="Shortcut Workflow"
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
                  
                  <FormControl fullWidth>
                    <CyberSelect
                      label="Workflow State"
                      value={currentStory?.workflow_state_id || ''}
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
                  
                  {/* Debug info */}
                  <Box sx={{ mt: 2, p: 1, border: '1px solid #666', borderRadius: 1, fontSize: '0.75rem' }}>
                    <Typography variant="caption" component="div">Debug Info:</Typography>
                    <Typography variant="caption" component="div">Selected Workflow: {selectedWorkflow || 'none'}</Typography>
                    <Typography variant="caption" component="div">Loading States: {loadingWorkflowStates ? 'yes' : 'no'}</Typography>
                    <Typography variant="caption" component="div">States Count: {workflowStates.length}</Typography>
                    <Typography variant="caption" component="div">Last Fetched ID: {lastFetchedWorkflowIdRef.current || 'none'}</Typography>
                  </Box>
                </Box>
              </>
            )}
          </CyberCard>
          
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
                value={currentStory?.labels?.join(', ') || ''}
                onChange={(e) => {
                  if (currentStory) {
                    const labelValue = e.target.value;
                    const labels = labelValue
                      .split(',')
                      .map(label => label.trim())
                      .filter(label => label !== '');
                    
                    setCurrentStory({
                      ...currentStory,
                      labels,
                    });
                  }
                }}
                cornerClip
              />
              {currentStory?.labels && currentStory.labels.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentStory.labels.map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      onDelete={() => {
                        if (currentStory) {
                          setCurrentStory({
                            ...currentStory,
                            labels: currentStory.labels?.filter(l => l !== label) || [],
                          });
                        }
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
          <CyberButton onClick={() => setStoryDialogOpen(false)}>
            Cancel
          </CyberButton>
          <CyberButton 
            onClick={handleSaveStory}
            variant="contained"
            disabled={!currentStory?.name}
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

      {/* Variable Dialog */}
      <Dialog 
        open={variableDialogOpen} 
        onClose={() => setVariableDialogOpen(false)}
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
          Add Variable
        </DialogTitle>
        <DialogContent>
          <CyberTextField
            fullWidth
            margin="normal"
            label="Variable Name"
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            helperText="This variable will be available for replacement when applying the template"
            cornerClip
          />
        </DialogContent>
        <DialogActions>
          <CyberButton onClick={() => setVariableDialogOpen(false)}>
            Cancel
          </CyberButton>
          <CyberButton 
            onClick={handleAddVariable}
            variant="contained"
            disabled={!newVariable.trim() || template.variables.includes(newVariable.trim())}
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
            Add
          </CyberButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditor;

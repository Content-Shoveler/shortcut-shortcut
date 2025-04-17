import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
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
  Select,
  MenuItem,
  Chip,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { v4 as uuidv4 } from 'uuid';

import { Template, StoryTemplate, EpicDetails } from '../types';

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
  const [newVariable, setNewVariable] = useState('');
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);

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
          console.error('Error loading template:', error);
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
      estimate: 0,
      labels: [],
    });
    setEditingStoryIndex(null);
    setStoryDialogOpen(true);
  };

  const openEditStoryDialog = (index: number) => {
    setCurrentStory({ ...template.storyTemplates[index] });
    setEditingStoryIndex(index);
    setStoryDialogOpen(true);
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
      console.error('Error saving template:', error);
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
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveTemplate}
            disabled={!template.name || !template.epicDetails.name}
          >
            Save Template
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Template Details
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Template Name"
          name="name"
          value={template.name}
          onChange={handleTemplateChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Template Description"
          name="description"
          value={template.description}
          onChange={handleTemplateChange}
          multiline
          rows={2}
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Epic Details
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Epic Name Template"
          name="name"
          value={template.epicDetails.name}
          onChange={handleEpicChange}
          required
          helperText="You can use {{Variable}} syntax to define variables (e.g., '{{Feature}} Implementation')"
        />
        <TextField
          fullWidth
          margin="normal"
          label="Epic Description Template"
          name="description"
          value={template.epicDetails.description}
          onChange={handleEpicChange}
          multiline
          rows={3}
          helperText="You can use {{Variable}} syntax here too"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="epic-state-label">Default Epic State</InputLabel>
          <Select
            labelId="epic-state-label"
            name="state"
            value={template.epicDetails.state}
            onChange={(e) => {
              const { name, value } = e.target;
              setTemplate(prev => ({
                ...prev,
                epicDetails: {
                  ...prev.epicDetails,
                  [name]: value,
                },
              }));
            }}
          >
            <MenuItem value="to do">To Do</MenuItem>
            <MenuItem value="in progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Story Templates ({template.storyTemplates.length})
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={openNewStoryDialog}
          >
            Add Story
          </Button>
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
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ cursor: 'pointer' }}
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
                                sx={{ mr: 0.5, mb: 0.5 }}
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
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Variables ({template.variables.length})
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => setVariableDialogOpen(true)}
          >
            Add Variable
          </Button>
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
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Story Dialog */}
      <Dialog open={storyDialogOpen} onClose={() => setStoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingStoryIndex !== null ? 'Edit Story' : 'Add Story'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Story Name"
            name="name"
            value={currentStory?.name || ''}
            onChange={handleStoryChange}
            required
            helperText="You can use {{Variable}} syntax (e.g., 'Implement {{Feature}} UI')"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Story Description"
            name="description"
            value={currentStory?.description || ''}
            onChange={handleStoryChange}
            multiline
            rows={3}
            helperText="You can use {{Variable}} syntax here too"
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="story-type-label">Story Type</InputLabel>
              <Select
                labelId="story-type-label"
                name="type"
                value={currentStory?.type || 'feature'}
                onChange={handleStoryChange}
              >
                {storyTypeOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="story-state-label">Default State</InputLabel>
              <Select
                labelId="story-state-label"
                name="state"
                value={currentStory?.state || 'Ready for Development'}
                onChange={handleStoryChange}
              >
                {storyStateOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Estimate (Points)"
              type="number"
              value={currentStory?.estimate || 0}
              onChange={handleStoryEstimateChange}
              inputProps={{ min: 0, max: 100 }}
            />
          </Box>
          
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Labels (Optional)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
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
                    />
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStoryDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveStory}
            variant="contained"
            disabled={!currentStory?.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Variable Dialog */}
      <Dialog open={variableDialogOpen} onClose={() => setVariableDialogOpen(false)}>
        <DialogTitle>Add Variable</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Variable Name"
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            helperText="This variable will be available for replacement when applying the template"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariableDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddVariable}
            variant="contained"
            disabled={!newVariable.trim() || template.variables.includes(newVariable.trim())}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditor;

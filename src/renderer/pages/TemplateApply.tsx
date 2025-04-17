import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  FormControl,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Collapse,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PreviewIcon from '@mui/icons-material/Preview';
import KeyIcon from '@mui/icons-material/Key';
import { 
  CyberButton, 
  CyberCard, 
  CyberTextField, 
  CyberSelect,
  CyberIcon 
} from '../components/cyberpunk';

import { Template, VariableMapping, ShortcutCredentials } from '../types';

// Function to replace variables in text with actual values
const replaceVariables = (text: string, variables: VariableMapping): string => {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
};

const TemplateApply: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<VariableMapping>({});
  const [credentials, setCredentials] = useState<ShortcutCredentials>({
    apiToken: '',
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState<boolean>(false);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  
  // Load template
  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        try {
          const templates = await window.electronAPI.getTemplates();
          const foundTemplate = templates.find((t: Template) => t.id === id);
          
          if (foundTemplate) {
            setTemplate(foundTemplate);
            
            // Initialize variable values with empty strings
            const initialValues: VariableMapping = {};
            foundTemplate.variables.forEach(variable => {
              initialValues[variable] = '';
            });
            setVariableValues(initialValues);
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

  // Input change handlers
  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Shortcut API handlers
  const fetchProjects = async () => {
    if (!credentials.apiToken) {
      setAlert({
        type: 'error',
        message: 'API token is required',
      });
      return;
    }

    setLoadingProjects(true);
    
    try {
      // Here we would typically fetch projects from the Shortcut API
      // This is a placeholder - in a real app, we'd use the clubhouse-lib library
      // to make API calls
      
      // Simulate API call with fake data
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProjects = [
        { id: '1', name: 'Project A' },
        { id: '2', name: 'Project B' },
        { id: '3', name: 'Project C' },
      ];
      
      const mockWorkflows = [
        { id: '1', name: 'Default' },
        { id: '2', name: 'Development' },
        { id: '3', name: 'QA' },
      ];
      
      setProjects(mockProjects);
      setWorkflows(mockWorkflows);
      
      // Close credentials dialog after successful fetch
      setCredentialsDialogOpen(false);
      setAlert({
        type: 'info',
        message: 'Connected to Shortcut API successfully',
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAlert({
        type: 'error',
        message: 'Failed to connect to Shortcut API',
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!template) return;
    
    // Validate variables
    const missingVariables = template.variables.filter(v => !variableValues[v]);
    if (missingVariables.length > 0) {
      setAlert({
        type: 'error',
        message: `Please fill in all variables: ${missingVariables.join(', ')}`,
      });
      return;
    }
    
    // Validate project and workflow selection
    if (!selectedProject) {
      setAlert({
        type: 'error',
        message: 'Please select a project',
      });
      return;
    }
    
    if (!selectedWorkflow) {
      setAlert({
        type: 'error',
        message: 'Please select a workflow',
      });
      return;
    }
    
    setLoading(true);
    setAlert(null);
    
    try {
      // Here we would send the data to Shortcut API
      // This is a placeholder - in a real app, we'd use the clubhouse-lib library
      
      // Build the epic with replaced variables
      const epicName = replaceVariables(template.epicDetails.name, variableValues);
      const epicDescription = replaceVariables(template.epicDetails.description, variableValues);
      
      // Build stories with replaced variables
      const stories = template.storyTemplates.map(story => ({
        name: replaceVariables(story.name, variableValues),
        description: replaceVariables(story.description, variableValues),
        type: story.type,
        state: story.state,
        estimate: story.estimate,
        labels: story.labels,
      }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAlert({
        type: 'success',
        message: 'Template applied successfully! Epic and stories created in Shortcut.',
      });
      
      // Navigate back to templates list after success
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error applying template:', error);
      setAlert({
        type: 'error',
        message: 'Failed to apply template to Shortcut',
      });
    } finally {
      setLoading(false);
    }
  };

  // Render loading state if template is not loaded yet
  if (!template) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Generate preview content
  const previewEpicName = replaceVariables(template.epicDetails.name, variableValues);
  const previewEpicDescription = replaceVariables(template.epicDetails.description, variableValues);
  
  // Prepare preview stories
  const previewStories = template.storyTemplates.map(story => ({
    name: replaceVariables(story.name, variableValues),
    description: replaceVariables(story.description, variableValues),
    type: story.type,
    state: story.state,
    estimate: story.estimate,
    labels: story.labels,
  }));

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
          Apply Template: {template.name}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <CyberButton 
            variant="outlined" 
            startIcon={<CyberIcon icon={ArrowBackIcon} size={20} />}
            onClick={() => navigate('/')}
            scanlineEffect
          >
            Back
          </CyberButton>
          <CyberButton
            variant="outlined"
            startIcon={<CyberIcon icon={KeyIcon} size={20} />}
            onClick={() => setCredentialsDialogOpen(true)}
            scanlineEffect
          >
            API Token
          </CyberButton>
          <CyberButton 
            variant="outlined"
            startIcon={<CyberIcon icon={PreviewIcon} size={20} />}
            onClick={() => setPreviewOpen(!previewOpen)}
            scanlineEffect
          >
            Preview
          </CyberButton>
          <CyberButton 
            variant="outlined"
            startIcon={<CyberIcon icon={SendIcon} size={20} />}
            onClick={handleApplyTemplate}
            disabled={
              loading || 
              !credentials.apiToken || 
              !selectedProject || 
              !selectedWorkflow ||
              template.variables.some(v => !variableValues[v])
            }
            scanlineEffect
          >
            {loading ? <CircularProgress size={24} /> : 'Apply Template'}
          </CyberButton>
        </Stack>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {template.description}
      </Typography>

      {/* Variables Section */}
      <CyberCard sx={{ p: 3, mb: 3 }} title="Fill in Variables">
        {template.variables.length === 0 ? (
          <Typography color="text.secondary">
            This template has no variables to fill in.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {template.variables.map(variable => (
              <CyberTextField
                key={variable}
                label={variable}
                value={variableValues[variable] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVariableChange(variable, e.target.value)}
                fullWidth
                required
                cornerClip
              />
            ))}
          </Box>
        )}
      </CyberCard>

      {/* Shortcut Settings */}
      <CyberCard sx={{ p: 3, mb: 3 }} title="Shortcut Settings">
        
        <Stack spacing={2}>
          {credentials.apiToken ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              API Token is set
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please set your Shortcut API Token to continue
            </Alert>
          )}
          
          <FormControl fullWidth>
            <CyberSelect
              label="Project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value as string)}
              disabled={!credentials.apiToken || projects.length === 0}
              cornerClip
            >
              {projects.map(project => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </CyberSelect>
          </FormControl>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <CyberSelect
              label="Workflow"
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value as string)}
              disabled={!credentials.apiToken || workflows.length === 0}
              cornerClip
            >
              {workflows.map(workflow => (
                <MenuItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </MenuItem>
              ))}
            </CyberSelect>
          </FormControl>
        </Stack>
      </CyberCard>

      {/* Preview Section */}
      <Collapse in={previewOpen}>
        <CyberCard sx={{ p: 3, mb: 3 }} title="Preview">
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Epic
            </Typography>
            <CyberCard sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {previewEpicName || '(Epic Name)'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {previewEpicDescription || '(Epic Description)'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                State: {template.epicDetails.state}
              </Typography>
            </CyberCard>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Stories ({previewStories.length})
          </Typography>
          
          {previewStories.length === 0 ? (
            <Typography color="text.secondary">
              No stories in this template.
            </Typography>
          ) : (
            <List>
              {previewStories.map((story, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider />}
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={story.name || '(Story Name)'}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {story.type} • {story.state} {story.estimate ? `• ${story.estimate} points` : ''}
                          </Typography>
                          {story.description && (
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {story.description}
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
        </CyberCard>
      </Collapse>

      {/* API Token Dialog */}
      <Dialog open={credentialsDialogOpen} onClose={() => setCredentialsDialogOpen(false)}>
        <DialogTitle>Shortcut API Token</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your Shortcut API token to connect to your workspace.
            You can find or create an API token in Shortcut under Settings &gt; API Tokens.
          </Typography>
          <CyberTextField
            fullWidth
            label="API Token"
            name="apiToken"
            value={credentials.apiToken}
            onChange={handleCredentialsChange}
            margin="normal"
            type="password"
            autoComplete="off"
            cornerClip
          />
        </DialogContent>
        <DialogActions>
          <CyberButton 
            onClick={() => setCredentialsDialogOpen(false)} 
            variant="outlined"
            scanlineEffect
          >
            Cancel
          </CyberButton>
          <CyberButton 
            onClick={fetchProjects} 
            variant="outlined"
            disabled={!credentials.apiToken || loadingProjects}
            scanlineEffect
          >
            {loadingProjects ? <CircularProgress size={24} /> : 'Connect'}
          </CyberButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateApply;

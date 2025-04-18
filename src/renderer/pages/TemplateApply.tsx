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
  Collapse,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PreviewIcon from '@mui/icons-material/Preview';
import SettingsIcon from '@mui/icons-material/Settings';
import { 
  CyberButton, 
  CyberCard, 
  CyberTextField, 
  CyberSelect,
  CyberIcon 
} from '../components/cyberpunk';

import { Template, VariableMapping } from '../types';
import { useShortcutApi } from '../hooks/useShortcutApi';
import { ShortcutProject, ShortcutWorkflow } from '../types/shortcutApi';
import { useSettings } from '../store/SettingsContext';

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
  const { updateApiToken } = useSettings();

  const [template, setTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<VariableMapping>({});
  
  // Initialize Shortcut API hook
  const shortcutApi = useShortcutApi();
  
  // For the API token dialog
  const [projects, setProjects] = useState<ShortcutProject[]>([]);
  const [workflows, setWorkflows] = useState<ShortcutWorkflow[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
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

  // Navigate to settings page
  const navigateToSettings = () => {
    navigate('/settings');
  };

  // Load projects and workflows if API token is available
  useEffect(() => {
    const loadProjectsAndWorkflows = async () => {
      if (shortcutApi.hasApiToken && projects.length === 0) {
        try {
          setLoadingProjects(true);
          const fetchedProjects = await shortcutApi.fetchProjects();
          const fetchedWorkflows = await shortcutApi.fetchWorkflows();
          
          setProjects(fetchedProjects);
          setWorkflows(fetchedWorkflows);
          
          setAlert({
            type: 'info',
            message: 'Connected to Shortcut API successfully',
          });
        } catch (error) {
          console.error('Error fetching Shortcut data:', error);
          setAlert({
            type: 'error',
            message: typeof error === 'object' && error !== null && 'message' in error 
              ? String(error.message) 
              : 'Failed to fetch data from Shortcut API',
          });
        } finally {
          setLoadingProjects(false);
        }
      }
    };
    
    loadProjectsAndWorkflows();
  }, [shortcutApi, projects.length, navigate]);

  // Input change handlers
  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev: VariableMapping) => ({
      ...prev,
      [variable]: value,
    }));
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
      
      // Create the epic with stories in Shortcut
      const result = await shortcutApi.createEpicWithStories(
        {
          name: epicName,
          description: epicDescription,
          state: template.epicDetails.state,
          projectId: selectedProject,
          workflowId: selectedWorkflow
        },
        stories
      );
      
      setAlert({
        type: 'success',
        message: `Template applied successfully! Epic #${result.epicId} and ${result.storyIds.length} stories created in Shortcut.`,
      });
      
      // Navigate back to templates list after success
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error applying template:', error);
      setAlert({
        type: 'error',
        message: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'Failed to apply template to Shortcut',
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

      {/* API Token Status Card - Only shown when token is missing */}
      {!shortcutApi.hasApiToken && (
        <CyberCard 
          sx={{ p: 3, mb: 3 }} 
          title="API Token Required"
          cornerAccent
          glowOnHover
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            You need to configure your Shortcut API Token in Settings before applying templates.
          </Typography>
          <CyberButton
            variant="outlined"
            startIcon={<CyberIcon icon={SettingsIcon} size={20} />}
            onClick={navigateToSettings}
            scanlineEffect
            glowIntensity={0.8}
          >
            Go to Settings
          </CyberButton>
        </CyberCard>
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
              !shortcutApi.hasApiToken || 
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
      <CyberCard sx={{ p: 3, mb: 3 }} title="Fill in Variables" cornerAccent glowOnHover>
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

      {/* Shortcut Settings - Only shown when API token is set */}
      {shortcutApi.hasApiToken && (
        <CyberCard sx={{ p: 3, mb: 3 }} title="Shortcut Settings" cornerAccent glowOnHover>
          <Stack spacing={2}>
            <Alert severity="success" sx={{ mb: 2 }}>
              API Token is set and valid
            </Alert>
            
            <FormControl fullWidth>
              <CyberSelect
                label="Project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value as string)}
                disabled={projects.length === 0 || loadingProjects}
                cornerClip
              >
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
                {projects.length === 0 && !loadingProjects && (
                  <MenuItem disabled value="">
                    No projects found
                  </MenuItem>
                )}
              </CyberSelect>
            </FormControl>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <CyberSelect
                label="Workflow"
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value as string)}
                disabled={workflows.length === 0 || loadingProjects}
                cornerClip
              >
                {workflows.map(workflow => (
                  <MenuItem key={workflow.id} value={workflow.id.toString()}>
                    {workflow.name}
                  </MenuItem>
                ))}
                {workflows.length === 0 && !loadingProjects && (
                  <MenuItem disabled value="">
                    No workflows found
                  </MenuItem>
                )}
              </CyberSelect>
            </FormControl>
            
            {loadingProjects && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Stack>
        </CyberCard>
      )}

      {/* Preview Section */}
      <Collapse in={previewOpen}>
        <CyberCard sx={{ p: 3, mb: 3 }} title="Preview" cornerAccent glowOnHover>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Epic
            </Typography>
            <CyberCard sx={{ p: 2, mb: 2 }} cornerAccent>
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

    </Box>
  );
};

export default TemplateApply;

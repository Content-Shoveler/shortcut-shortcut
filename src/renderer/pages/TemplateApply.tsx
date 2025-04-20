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
  Stack,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';

import { 
  CyberButton, 
  CyberCard, 
  CyberTextField, 
  CyberIcon 
} from '../components/cyberpunk';

import { Template, VariableMapping } from '../types';
import { useShortcutApi } from '../hooks/useShortcutApi';

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
  const shortcutApi = useShortcutApi();

  // State management
  const [template, setTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<VariableMapping>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Load template on component mount
  useEffect(() => {
    const loadTemplate = async () => {
      if (!id) return;
      
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
        setAlert({
          type: 'error',
          message: 'Failed to load template',
        });
      }
    };

    loadTemplate();
  }, [id, navigate]);

  // Navigate to settings page
  const navigateToSettings = () => {
    navigate('/settings');
  };

  // Handle variable input changes
  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value,
    }));
  };

  // Handle template application
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
    
    setLoading(true);
    setAlert(null);
    
    try {
      // Build the epic with replaced variables
      const epicName = replaceVariables(template.epicDetails.name, variableValues);
      const epicDescription = replaceVariables(template.epicDetails.description, variableValues);
      
      // Build stories with replaced variables - making sure we match expected types
      const stories = template.storyTemplates.map(story => {
        // Process tasks if they exist, applying variable replacement to each task description
        const processedTasks = story.tasks?.map(task => ({
          ...task,
          description: replaceVariables(task.description, variableValues)
        }));
        
        // Create a properly typed object with exact fields expected by the API
        const storyPayload = {
          name: replaceVariables(story.name, variableValues),
          description: replaceVariables(story.description, variableValues),
          type: story.type,
          state: story.state,
          workflow_state_id: story.workflow_state_id,
          estimate: story.estimate,
          owner_ids: story.owner_ids,
          // Explicitly convert iteration_id to number when it exists
          iteration_id: story.iteration_id ? Number(story.iteration_id) : undefined,
          // Include the processed tasks with variable replacement
          tasks: processedTasks
        };
        
        return storyPayload;
      });
      
      // Find a workflowId from the first story with one, or use a default
      const workflowId = template.storyTemplates.find(s => s.workflow_id)?.workflow_id || '';
      if (!workflowId) {
        throw new Error('No workflow ID found in any story template');
      }
      
      // Create the epic with stories in Shortcut
      const result = await shortcutApi.createEpicWithStories(
        {
          ...template.epicDetails,  // Include ALL fields from the template
          name: epicName,           // Override just the fields that need variable replacement
          description: epicDescription
        },
        workflowId,
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to apply template to Shortcut';
        
      // Show specific message for API token issues
      const message = errorMessage.includes('API token') || errorMessage.includes('401') || errorMessage.includes('403')
        ? 'Invalid API token. Please update your Shortcut API token in Settings.'
        : errorMessage;
        
      setAlert({
        type: 'error',
        message
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
  const previewStories = template.storyTemplates.map(story => ({
    name: replaceVariables(story.name, variableValues),
    description: replaceVariables(story.description, variableValues),
    type: story.type,
    state: story.state,
    estimate: story.estimate
    // Removed labels property
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

      {/* API Token Status Alert - Only shown when shortcutApi.hasApiToken is false */}
      {!shortcutApi.hasApiToken && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
          action={
            <CyberButton
              variant="outlined"
              size="small"
              startIcon={<CyberIcon icon={SettingsIcon} size={16} />}
              onClick={navigateToSettings}
              scanlineEffect
              glowIntensity={0.6}
              sx={{ ml: 1 }}
            >
              Settings
            </CyberButton>
          }
        >
          Configure your Shortcut API Token to apply templates
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Apply Epic: {template.epicDetails.name}
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
            startIcon={<CyberIcon icon={SendIcon} size={20} />}
            onClick={handleApplyTemplate}
            disabled={
              loading || 
              template.variables.some(v => !variableValues[v])
            }
            scanlineEffect
          >
            {loading ? <CircularProgress size={24} /> : 'Apply Template'}
          </CyberButton>
        </Stack>
      </Box>


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

      {/* Preview Section */}
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
                        {/* Removed label rendering */}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CyberCard>
    </Box>
  );
};

export default TemplateApply;

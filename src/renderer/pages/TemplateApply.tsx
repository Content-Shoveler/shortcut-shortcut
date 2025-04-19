import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Collapse,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import PreviewIcon from '@mui/icons-material/Preview';
import { 
  CyberButton, 
  CyberCard, 
  CyberTextField, 
  CyberSelect,
  CyberIcon 
} from '../components/cyberpunk';

import { Template, VariableMapping } from '../types';
import { useShortcutApi } from '../hooks/useShortcutApi';
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
  
  // State variables
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(true);
  const [tokenState, setTokenState] = useState<'valid' | 'invalid' | 'loading'>('loading');
  
  // Navigate to settings page with a flag to know we need to revalidate when returning
  const navigateToSettings = () => {
    // Set a session flag to know we came from TemplateApply 
    sessionStorage.setItem('returnToTemplateApply', 'true');
    navigate('/settings');
  };
  
  // Check if we returned from settings on mount
  useEffect(() => {
    const checkReturnFromSettings = () => {
      const returnFlag = sessionStorage.getItem('returnToTemplateApply');
      
      if (returnFlag === 'true') {
        // Clear the flag
        sessionStorage.removeItem('returnToTemplateApply');
        
        // Update token state based on API token availability
        if (shortcutApi.hasApiToken) {
          setTokenState('valid');
          setAlert({
            type: 'info',
            message: 'Connected to Shortcut API successfully',
          });
        } else {
          setTokenState('invalid');
        }
      }
    };
    
    checkReturnFromSettings();
  }, [shortcutApi.hasApiToken]);

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
          setAlert({
            type: 'error',
            message: 'Failed to load template',
          });
        }
      }
    };

    loadTemplate();
  }, [id, navigate]);

  // Check token state when it changes
  useEffect(() => {
    // Just update token state based on API token
    if (shortcutApi.hasApiToken) {
      if (tokenState !== 'valid') {
        setTokenState('valid');
      }
    } else {
      if (tokenState !== 'invalid') {
        setTokenState('invalid');
      }
    }
  }, [shortcutApi.hasApiToken, tokenState]);

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
    
    setLoading(true);
    setAlert(null);
    
    try {
      // Build the epic with replaced variables
      const epicName = replaceVariables(template.epicDetails.name, variableValues);
      const epicDescription = replaceVariables(template.epicDetails.description, variableValues);
      
      // Build stories with replaced variables and pass workflow data directly from template
      const stories = template.storyTemplates.map(story => ({
        name: replaceVariables(story.name, variableValues),
        description: replaceVariables(story.description, variableValues),
        type: story.type,
        state: story.state,
        workflow_id: story.workflow_id,
        workflow_state_id: story.workflow_state_id,
        estimate: story.estimate,
        labels: story.labels,
      }));
      
      // Find a workflowId from the first story with one, or use a default
      const workflowId = template.storyTemplates.find(s => s.workflow_id)?.workflow_id || '';
      if (!workflowId) {
        throw new Error('No workflow ID found in any story template');
      }
      
      // Create the epic with stories in Shortcut
      const result = await shortcutApi.createEpicWithStories(
        {
          name: epicName,
          description: epicDescription,
          state: template.epicDetails.state,
          workflowId: workflowId
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

      {/* API Token Status Alert - Modified to match connected state alert */}
      {tokenState !== 'valid' && (
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
            startIcon={<CyberIcon icon={SendIcon} size={20} />}
            onClick={handleApplyTemplate}
            disabled={
              loading || 
              !shortcutApi.hasApiToken || 
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

      {/* Preview Section - Always visible */}
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
    </Box>
  );
};

export default TemplateApply;

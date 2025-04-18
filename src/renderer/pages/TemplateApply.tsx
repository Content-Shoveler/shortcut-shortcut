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
  FormControl,
  MenuItem,
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
  
  // Debug values to help diagnose button disabled state
  const [debugHasApiToken, setDebugHasApiToken] = useState(false);
  const [overrideDisabled, setOverrideDisabled] = useState(false);
  
  // Monitor hasApiToken changes
  useEffect(() => {
    setDebugHasApiToken(shortcutApi.hasApiToken);
  }, [shortcutApi.hasApiToken]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  // Preview is always visible
  const [previewOpen, setPreviewOpen] = useState<boolean>(true);
  const [tokenState, setTokenState] = useState<'valid' | 'invalid' | 'loading'>('loading');
  
  // For tracking component mount/remount and other non-render-triggering state
  const mountCountRef = useRef(0);
  const isLoadingDataRef = useRef(false);
  const previousHasApiTokenRef = useRef(shortcutApi.hasApiToken);
  const dataLoadAttemptedRef = useRef(false);
  
  useEffect(() => {
    mountCountRef.current += 1;
    
    return () => {
      // Cleanup on unmount
    };
  }, []);
  
  // Function to load projects and workflows - defined before it's used in useEffect
  const loadProjectsAndWorkflows = useCallback(async () => {
    // Prevent concurrent calls to avoid cascading state updates
    if (isLoadingDataRef.current) {
      return;
    }
    
    if (shortcutApi.hasApiToken && (projects.length === 0 || tokenState === 'loading')) {
      // Set the loading flag before any state updates
      isLoadingDataRef.current = true;
      dataLoadAttemptedRef.current = true;
      
      try {
        // Only update loadingProjects state if not already true
        if (!loadingProjects) {
          setLoadingProjects(true);
        }
        
        const fetchedProjects = await shortcutApi.fetchProjects();
        const fetchedWorkflows = await shortcutApi.fetchWorkflows();
        
        // Only update state if component is still mounted and data has changed
        if (JSON.stringify(projects) !== JSON.stringify(fetchedProjects)) {
          setProjects(fetchedProjects);
        }
        
        if (JSON.stringify(workflows) !== JSON.stringify(fetchedWorkflows)) {
          setWorkflows(fetchedWorkflows);
        }
        
        setAlert({
          type: 'info',
          message: 'Connected to Shortcut API successfully',
        });
        
        // Only update tokenState if it's changing
        if (tokenState !== 'valid') {
          setTokenState('valid');
        }
      } catch (error) {
        setAlert({
          type: 'error',
          message: typeof error === 'object' && error !== null && 'message' in error 
            ? String(error.message) 
            : 'Failed to fetch data from Shortcut API',
        });
        
        // Only update tokenState if it's changing
        if (tokenState !== 'invalid') {
          setTokenState('invalid');
        }
      } finally {
        setLoadingProjects(false);
        isLoadingDataRef.current = false;
      }
    } else if (!shortcutApi.hasApiToken) {
      // Only update state if it's changing
      if (tokenState !== 'invalid') {
        setTokenState('invalid');
      }
    }
  }, [shortcutApi.hasApiToken, shortcutApi.fetchProjects, shortcutApi.fetchWorkflows, tokenState, loadingProjects, projects, workflows]);
  
  // Navigate to settings page with a flag to know we need to revalidate when returning
  const navigateToSettings = () => {
    // Set a session flag to know we came from TemplateApply 
    sessionStorage.setItem('returnToTemplateApply', 'true');
    navigate('/settings');
  };
  
  // Check if we returned from settings on mount - now this is defined after loadProjectsAndWorkflows
  useEffect(() => {
    const checkReturnFromSettings = () => {
      const returnFlag = sessionStorage.getItem('returnToTemplateApply');
      
      if (returnFlag === 'true') {
        // Clear the flag
        sessionStorage.removeItem('returnToTemplateApply');
        
        // Before checking if API token is available in the hook,
        // check localStorage directly as a backup
        try {
          const savedSettings = localStorage.getItem('appSettings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed.apiToken) {
              // Force a validation of the token found in localStorage
              const api = window.electronAPI as any;
              api.shortcutApi.validateToken(parsed.apiToken)
                .then((result: any) => {
                  // If validation passed, force a reload
                  if (result.success) {
                    // Force a state refresh regardless of shortcutApi.hasApiToken
                    setTokenState('loading');
                    setTimeout(() => {
                      loadProjectsAndWorkflows();
                    }, 100);
                  }
                })
                .catch((_err: any) => {
                  // Error in validation
                });
            }
          }
        } catch (e) {
          // Error checking localStorage
        }
        
        // Standard flow with shortcutApi
        if (shortcutApi.hasApiToken) {
          // Add a timeout to ensure the component has fully mounted
          setTimeout(() => {
            setTokenState('loading'); // Force refresh
            loadProjectsAndWorkflows();
          }, 100);
        }
      }
    };
    
    checkReturnFromSettings();
  }, [shortcutApi.hasApiToken, loadProjectsAndWorkflows]);

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

  // Check token state and load data when it changes - with guards to prevent loops
  useEffect(() => {
    // Skip if nothing has changed
    if (previousHasApiTokenRef.current === shortcutApi.hasApiToken && dataLoadAttemptedRef.current) {
      return;
    }
    
    // Update our ref to prevent unnecessary future runs
    previousHasApiTokenRef.current = shortcutApi.hasApiToken;
    
    // Use a small timeout to debounce multiple rapid state changes
    const timeoutId = setTimeout(() => {
      if (shortcutApi.hasApiToken) {
        loadProjectsAndWorkflows();
      } else {
        if (tokenState !== 'invalid') {
          setTokenState('invalid');
        }
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [shortcutApi.hasApiToken, loadProjectsAndWorkflows, tokenState]);

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
              (!overrideDisabled && !shortcutApi.hasApiToken) || // Skip API token check if override is enabled
              template.variables.some(v => !variableValues[v])
            }
            scanlineEffect
          >
            {loading ? <CircularProgress size={24} /> : (overrideDisabled ? '🔓 Apply Template' : 'Apply Template')}
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

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  console.log('🌍 TemplateApply: Component rendering');

  const [template, setTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<VariableMapping>({});
  
  // Initialize Shortcut API hook
  const shortcutApi = useShortcutApi();
  console.log('🌍 TemplateApply: shortcutApi.hasApiToken =', shortcutApi.hasApiToken);
  console.log('🌍 TemplateApply: shortcutApi.tokenValidated =', shortcutApi.tokenValidated);
  
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
    console.log('🔍 hasApiToken changed in useShortcutApi:', shortcutApi.hasApiToken);
    setDebugHasApiToken(shortcutApi.hasApiToken);
  }, [shortcutApi.hasApiToken]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [tokenState, setTokenState] = useState<'valid' | 'invalid' | 'loading'>('loading');
  
  // For tracking component mount/remount and other non-render-triggering state
  const mountCountRef = useRef(0);
  const isLoadingDataRef = useRef(false);
  const previousHasApiTokenRef = useRef(shortcutApi.hasApiToken);
  const dataLoadAttemptedRef = useRef(false);
  
  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`🌍 TemplateApply: Component mounted/remounted (count: ${mountCountRef.current})`);
    
    // Log localStorage state on mount
    const storedSettings = localStorage.getItem('appSettings');
    console.log('🌍 TemplateApply: Current localStorage state on mount:', storedSettings);
    
    return () => {
      console.log('🌍 TemplateApply: Component unmounting');
    };
  }, []);
  
  // Function to load projects and workflows - defined before it's used in useEffect
  const loadProjectsAndWorkflows = useCallback(async () => {
    console.log('🌍 TemplateApply: loadProjectsAndWorkflows function called');
    
    // Prevent concurrent calls to avoid cascading state updates
    if (isLoadingDataRef.current) {
      console.log('🌍 TemplateApply: Already loading data, skipping duplicate call');
      return;
    }
    
    console.log('🌍 TemplateApply: Current state -', {
      hasApiToken: shortcutApi.hasApiToken,
      tokenValidated: shortcutApi.tokenValidated,
      tokenState,
      projectsLength: projects.length
    });
    
    if (shortcutApi.hasApiToken && (projects.length === 0 || tokenState === 'loading')) {
      console.log('🌍 TemplateApply: Conditions met to load projects/workflows');
      
      // Set the loading flag before any state updates
      isLoadingDataRef.current = true;
      dataLoadAttemptedRef.current = true;
      
      try {
        // Only update loadingProjects state if not already true
        if (!loadingProjects) {
          console.log('🌍 TemplateApply: Setting loadingProjects to true');
          setLoadingProjects(true);
        }
        
        console.log('🌍 TemplateApply: Calling fetchProjects...');
        const fetchedProjects = await shortcutApi.fetchProjects();
        console.log('🌍 TemplateApply: fetchProjects returned', fetchedProjects.length, 'projects');
        
        console.log('🌍 TemplateApply: Calling fetchWorkflows...');
        const fetchedWorkflows = await shortcutApi.fetchWorkflows();
        console.log('🌍 TemplateApply: fetchWorkflows returned', fetchedWorkflows.length, 'workflows');
        
        // Only update state if component is still mounted and data has changed
        if (JSON.stringify(projects) !== JSON.stringify(fetchedProjects)) {
          console.log('🌍 TemplateApply: Updating projects state with fetched data');
          setProjects(fetchedProjects);
        }
        
        if (JSON.stringify(workflows) !== JSON.stringify(fetchedWorkflows)) {
          console.log('🌍 TemplateApply: Updating workflows state with fetched data');
          setWorkflows(fetchedWorkflows);
        }
        
        setAlert({
          type: 'info',
          message: 'Connected to Shortcut API successfully',
        });
        
        // Only update tokenState if it's changing
        if (tokenState !== 'valid') {
          console.log('🌍 TemplateApply: Setting tokenState from', tokenState, 'to valid');
          setTokenState('valid');
        }
      } catch (error) {
        console.error('🌍 TemplateApply: Error fetching Shortcut data:', error);
        setAlert({
          type: 'error',
          message: typeof error === 'object' && error !== null && 'message' in error 
            ? String(error.message) 
            : 'Failed to fetch data from Shortcut API',
        });
        
        // Only update tokenState if it's changing
        if (tokenState !== 'invalid') {
          console.log('🌍 TemplateApply: Setting tokenState to invalid due to error');
          setTokenState('invalid');
        }
      } finally {
        console.log('🌍 TemplateApply: Setting loadingProjects to false');
        setLoadingProjects(false);
        isLoadingDataRef.current = false;
      }
    } else if (!shortcutApi.hasApiToken) {
      console.log('🌍 TemplateApply: No valid API token available, setting tokenState to invalid');
      
      // Only update state if it's changing
      if (tokenState !== 'invalid') {
        setTokenState('invalid');
      }
    } else {
      console.log('🌍 TemplateApply: Skipping data load - conditions not met');
    }
  }, [shortcutApi.hasApiToken, shortcutApi.fetchProjects, shortcutApi.fetchWorkflows, tokenState, loadingProjects, projects, workflows]);
  
  // Navigate to settings page with a flag to know we need to revalidate when returning
  const navigateToSettings = () => {
    console.log('🌍 TemplateApply: Navigating to settings page');
    // Set a session flag to know we came from TemplateApply 
    sessionStorage.setItem('returnToTemplateApply', 'true');
    navigate('/settings');
  };
  
  // Check if we returned from settings on mount - now this is defined after loadProjectsAndWorkflows
  useEffect(() => {
    const checkReturnFromSettings = () => {
      const returnFlag = sessionStorage.getItem('returnToTemplateApply');
      console.log('🌍 TemplateApply: Return flag from settings:', returnFlag);
      
      if (returnFlag === 'true') {
        console.log('🌍 TemplateApply: Returned from settings, triggering state refresh');
        // Clear the flag
        sessionStorage.removeItem('returnToTemplateApply');
        
        // Before checking if API token is available in the hook,
        // check localStorage directly as a backup
        try {
          const savedSettings = localStorage.getItem('appSettings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed.apiToken) {
              console.log('🌍 TemplateApply: Found token in localStorage directly:', 
                        parsed.apiToken.substring(0, 4) + '...');
              
              // Force a validation of the token found in localStorage
              console.log('🌍 TemplateApply: Forcing token validation from localStorage');
              const api = window.electronAPI as any;
              api.shortcutApi.validateToken(parsed.apiToken)
                .then((result: any) => {
                  console.log('🌍 TemplateApply: Direct validation result:', result);
                  
                  // If validation passed, force a reload
                  if (result.success) {
                    console.log('🌍 TemplateApply: Direct validation succeeded, forcing state refresh');
                    // Force a state refresh regardless of shortcutApi.hasApiToken
                    setTokenState('loading');
                    setTimeout(() => {
                      loadProjectsAndWorkflows();
                    }, 100);
                  }
                })
                .catch((err: any) => {
                  console.error('🌍 TemplateApply: Error in direct validation:', err);
                });
            }
          }
        } catch (e) {
          console.error('🌍 TemplateApply: Error checking localStorage:', e);
        }
        
        // Standard flow with shortcutApi
        if (shortcutApi.hasApiToken) {
          console.log('🌍 TemplateApply: Forcing loadProjectsAndWorkflows after returning from settings');
          // Add a timeout to ensure the component has fully mounted
          setTimeout(() => {
            setTokenState('loading'); // Force refresh
            loadProjectsAndWorkflows();
          }, 100);
        } else {
          console.log('🌍 TemplateApply: Token not recognized by hook, trying direct localStorage check');
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

  // Check token state and load data when it changes - with guards to prevent loops
  useEffect(() => {
    console.log('🌍 TemplateApply: Token status effect triggered');
    console.log('🌍 TemplateApply: hasApiToken:', shortcutApi.hasApiToken);
    console.log('🌍 TemplateApply: tokenValidated:', shortcutApi.tokenValidated);
    console.log('🌍 TemplateApply: Current tokenState:', tokenState);
    
    // Skip if nothing has changed
    if (previousHasApiTokenRef.current === shortcutApi.hasApiToken && dataLoadAttemptedRef.current) {
      console.log('🌍 TemplateApply: Token state unchanged, skipping effect');
      return;
    }
    
    // Update our ref to prevent unnecessary future runs
    previousHasApiTokenRef.current = shortcutApi.hasApiToken;
    
    // Log localStorage state on token change
    const storedSettings = localStorage.getItem('appSettings');
    try {
      const parsedSettings = JSON.parse(storedSettings || '{}');
      console.log('🌍 TemplateApply: Current localStorage apiToken:', 
                  parsedSettings.apiToken ? `${parsedSettings.apiToken.substring(0, 4)}...` : 'none');
    } catch (e) {
      console.error('🌍 TemplateApply: Error parsing localStorage settings:', e);
    }
    
    // Use a small timeout to debounce multiple rapid state changes
    const timeoutId = setTimeout(() => {
      if (shortcutApi.hasApiToken) {
        console.log('🌍 TemplateApply: hasApiToken is true, calling loadProjectsAndWorkflows');
        loadProjectsAndWorkflows();
      } else {
        console.log('🌍 TemplateApply: hasApiToken is false, setting tokenState to invalid');
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

      {/* API Token Status Card - Only shown when token is missing or invalid */}
      {tokenState !== 'valid' && (
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
              (!overrideDisabled && !shortcutApi.hasApiToken) || // Skip API token check if override is enabled
              !selectedProject || 
              !selectedWorkflow ||
              template.variables.some(v => !variableValues[v])
            }
            scanlineEffect
            onMouseEnter={() => {
              // Diagnostic logging to figure out which condition is causing the button to be disabled
              console.log('🔍 Apply Button Disabled Condition Check:', {
                loading: loading,
                hasApiToken: shortcutApi.hasApiToken,
                overrideDisabled: overrideDisabled,
                effectiveHasApiToken: overrideDisabled || shortcutApi.hasApiToken,
                selectedProject: selectedProject,
                selectedWorkflow: selectedWorkflow,
                variablesFilled: !template.variables.some(v => !variableValues[v])
              });
            }}
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
                onChange={(e) => {
                  console.log("🔄 Project selected:", e.target.value);
                  setSelectedProject(e.target.value as string);
                }}
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
                onChange={(e) => {
                  console.log("🔄 Workflow selected:", e.target.value);
                  setSelectedWorkflow(e.target.value as string);
                }}
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
            
            {/* Debug info to help troubleshoot button being disabled */}
            <Box sx={{ mt: 2, p: 2, border: '1px dashed #aaa', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Debug Info:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip 
                  label={`API Token: ${shortcutApi.hasApiToken ? '✅' : '❌'}`} 
                  size="small" 
                  color={shortcutApi.hasApiToken ? "success" : "error"} 
                />
                <Chip 
                  label={`Debug API: ${debugHasApiToken ? '✅' : '❌'}`} 
                  size="small" 
                  color={debugHasApiToken ? "success" : "error"} 
                />
                <Chip 
                  label={`Project: ${selectedProject ? '✅' : '❌'}`} 
                  size="small" 
                  color={selectedProject ? "success" : "error"} 
                />
                <Chip 
                  label={`Workflow: ${selectedWorkflow ? '✅' : '❌'}`} 
                  size="small" 
                  color={selectedWorkflow ? "success" : "error"} 
                />
                <Chip 
                  label={`Variables: ${!template.variables.some(v => !variableValues[v]) ? '✅' : '❌'}`} 
                  size="small" 
                  color={!template.variables.some(v => !variableValues[v]) ? "success" : "error"} 
                />
              </Stack>
              
              {/* Debug override button for testing */}
              <Stack direction="row" spacing={2}>
                <CyberButton 
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setOverrideDisabled(!overrideDisabled);
                    console.log('🔍 Override disabled state:', !overrideDisabled);
                  }}
                  scanlineEffect
                >
                  {overrideDisabled ? "Disable Override" : "Override Disabled State"}
                </CyberButton>
                
                <CyberButton 
                  variant="outlined"
                  size="small"
                  onClick={handleApplyTemplate}
                  scanlineEffect
                  disabled={loading}
                >
                  Force Apply Template
                </CyberButton>
              </Stack>
            </Box>
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

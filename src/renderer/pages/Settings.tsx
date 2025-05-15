import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  InputAdornment,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  alpha
} from '@mui/material';
import { Visibility, VisibilityOff, ExpandMore, CheckCircle, Error, Refresh, DeleteSweep } from '@mui/icons-material';
import { useTheme, useSettings } from '../store/AppProviders';
import { useCache } from '../store/CacheContext';
import { 
  CyberCard, 
  CyberTextField, 
  CyberButton, 
  CyberSwitch, 
  CyberTabs, 
  CyberRadio,
  CyberIcon
} from '../components/cyberpunk';

// Cache Monitor Panel Component
const CacheMonitorPanel: React.FC = () => {
  const { getCacheKeys, getCache, invalidateCache, clearCache } = useCache();
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  // Update cache keys when component mounts or refresh is triggered
  useEffect(() => {
    setCacheKeys(getCacheKeys());
  }, [getCacheKeys, refreshCount]);

  // Calculate time until expiration
  const getTimeUntilExpiration = (key: string): string => {
    const entry = getCache(key);
    if (!entry || !entry?.timestamp || !entry?.expiresAt) {
      return 'Unknown';
    }
    
    const now = Date.now();
    const expiresIn = entry.expiresAt - now;
    
    if (expiresIn <= 0) {
      return 'Expired';
    }
    
    // Format time remaining
    const seconds = Math.floor((expiresIn / 1000) % 60);
    const minutes = Math.floor((expiresIn / (1000 * 60)) % 60);
    const hours = Math.floor(expiresIn / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  // Handle clearing all cache
  const handleClearAll = () => {
    clearCache();
    setRefreshCount(prev => prev + 1);
  };

  // Handle clearing specific cache entry
  const handleClearEntry = (key: string) => {
    invalidateCache(key);
    setRefreshCount(prev => prev + 1);
  };

  // Get endpoint name from cache key for better display
  const getEndpointName = (key: string): string => {
    if (key.includes('projects')) return 'Projects';
    if (key.includes('workflows')) return 'Workflows';
    if (key.includes('workflow-states')) return 'Workflow States';
    if (key.includes('epic-workflow')) return 'Epic Workflow';
    if (key.includes('members')) return 'Members';
    if (key.includes('labels')) return 'Labels';
    if (key.includes('objectives')) return 'Objectives';
    if (key.includes('iterations')) return 'Iterations';
    return 'Other';
  };

  return (
    <Box>
      <Typography paragraph>
        <strong>API Cache Monitor:</strong> View and manage the in-memory API cache to improve performance and reduce API calls.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <CyberButton 
          onClick={handleRefresh}
          variant="outlined"
          startIcon={<CyberIcon icon={Refresh} />}
          glowIntensity={0.4}
        >
          Refresh
        </CyberButton>
        
        <CyberButton 
          onClick={handleClearAll}
          variant="outlined"
          color="error"
          startIcon={<CyberIcon icon={DeleteSweep} />}
          glowIntensity={0.4}
        >
          Clear All Cache
        </CyberButton>
      </Box>
      
      <Typography variant="subtitle1" gutterBottom>
        Cache Entries: {cacheKeys.length}
      </Typography>
      
      {cacheKeys.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No cache entries found. Cache entries will be created as you interact with the application.
        </Alert>
      ) : (
        <List sx={{ 
          maxHeight: '300px', 
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 0
        }}>
          {cacheKeys.map((key) => (
            <ListItem
              key={key}
              divider
              secondaryAction={
                <CyberButton 
                  size="small"
                  onClick={() => handleClearEntry(key)}
                  variant="text"
                  color="error"
                  startIcon={<CyberIcon icon={DeleteSweep} size={16} />}
                >
                  Clear
                </CyberButton>
              }
              sx={{ 
                bgcolor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? 'rgba(0, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)'
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" component="span" fontWeight="bold">
                      {getEndpointName(key)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      Expires in: {getTimeUntilExpiration(key)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    {key}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Cache entries are automatically invalidated when they expire or when related data is created/updated.
      </Typography>
    </Box>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

const Settings: React.FC = () => {
  const theme = useTheme();
  const { mode, themeAppearance, setTheme } = theme;
  const { settings, updateSettings, updateApiToken, validateApiToken } = useSettings();
  
  const [tabValue, setTabValue] = useState(0);
  const [apiToken, setApiToken] = useState(settings.apiToken);
  const [showApiToken, setShowApiToken] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{ valid: boolean | null }>({
    valid: null,
  });

  // Validate token on initial load if one exists
  useEffect(() => {
    if (settings.apiToken) {
      const validateTokenOnLoad = async () => {
        try {
          const isValid = await validateApiToken(settings.apiToken);
          setTokenStatus({ valid: isValid });
        } catch (error) {
          setTokenStatus({ valid: false });
        }
      };
      validateTokenOnLoad();
    }
  }, [settings.apiToken, validateApiToken]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle API token changes
  const handleApiTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiToken(event.target.value);
    // Reset validation when token changes
    if (tokenStatus.valid !== null) {
      setTokenStatus({ valid: null });
    }
  };

  // Validate API token
  const handleValidateToken = async () => {
    setValidatingToken(true);
    try {
      const isValid = await validateApiToken(apiToken);
      
      setTokenStatus({ valid: isValid });
      
      if (isValid) {
        // Update token in context
        updateApiToken(apiToken);
        
        // Set a flag in sessionStorage that we're returning from Settings with a valid token
        // This will help TemplateApply detect that it should refresh its token state
        sessionStorage.setItem('returnToTemplateApply', 'true');
      }
    } catch (error) {
      setTokenStatus({ valid: false });
    } finally {
      setValidatingToken(false);
    }
  };

  // Handle theme mode change
  const handleThemeModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.value as 'system' | 'light' | 'dark');
  };

  // Handle density change
  const handleDensityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      appearance: {
        ...settings.appearance,
        density: event.target.value as 'comfortable' | 'compact',
      },
    });
  };

  // Handle font size change
  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      appearance: {
        ...settings.appearance,
        fontSize: event.target.value as 'small' | 'medium' | 'large',
      },
    });
  };

  // Handle view mode change
  const handleViewModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      appearance: {
        ...settings.appearance,
        viewMode: event.target.value as 'card' | 'list',
      },
    });
  };

  // Handle startup page change
  const handleStartupPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      startupPage: event.target.value as 'home' | 'last-viewed',
    });
  };

  // Handle confirmation dialog toggle
  const handleConfirmDialogChange = (dialogType: 'deleteTemplate' | 'applyTemplate') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateSettings({
      confirmDialogs: {
        ...settings.confirmDialogs,
        [dialogType]: event.target.checked,
      },
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <CyberCard sx={{ mt: 3 }}>
        <Box>
          <CyberTabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            centered
            scanlineEffect
          >
            <CyberTabs.Tab label="General" {...a11yProps(0)} />
            <CyberTabs.Tab label="Appearance" {...a11yProps(1)} />
            <CyberTabs.Tab label="Behavior" {...a11yProps(2)} />
            <CyberTabs.Tab label="Help" {...a11yProps(3)} />
          </CyberTabs>
        </Box>

        {/* General Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            API Token
          </Typography>
          <Box sx={{ maxWidth: 500, mb: 3 }}>
            <CyberTextField
              fullWidth
              label="Shortcut API Token"
              variant="outlined"
              value={apiToken}
              onChange={handleApiTokenChange}
              margin="normal"
              type={showApiToken ? 'text' : 'password'}
              helperText="Enter your Shortcut API token for authentication"
              cornerClip
              scanlineEffect
              InputProps={{
                startAdornment: tokenStatus.valid !== null && (
                  <InputAdornment position="start">
                    <CyberIcon 
                      icon={tokenStatus.valid ? CheckCircle : Error} 
                      color={tokenStatus.valid ? '#00E64D' : '#FF3E3E'}
                      pulse={tokenStatus.valid}
                      glowIntensity={tokenStatus.valid ? 0.7 : 0}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <CyberIcon.Button
                      icon={showApiToken ? VisibilityOff : Visibility}
                      aria-label="toggle token visibility"
                      onClick={() => setShowApiToken(!showApiToken)}
                      edge="end"
                      iconSize={22}
                      pulse={!showApiToken}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <CyberButton
              variant="contained"
              onClick={handleValidateToken}
              disabled={!apiToken || validatingToken || tokenStatus.valid === true}
              sx={{ mt: 1 }}
              scanlineEffect
              glowIntensity={0.7}
            >
              {validatingToken ? <CircularProgress size={24} /> : 'Validate & Save Token'}
            </CyberButton>
          </Box>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Theme
          </Typography>
          <CyberRadio.Group
            label="Theme Mode"
            value={mode}
            onChange={handleThemeModeChange}
            name="theme-mode-group"
          >
            <CyberRadio.FormControlLabel value="system" label="System Default" />
            <CyberRadio.FormControlLabel value="light" label="Light" />
            <CyberRadio.FormControlLabel value="dark" label="Dark" />
          </CyberRadio.Group>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current appearance: {themeAppearance === 'light' ? 'Light' : 'Dark'} 
            {mode === 'system' ? ' (based on system settings)' : ''}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Density
          </Typography>
          <CyberRadio.Group
            label="UI Density"
            value={settings.appearance.density}
            onChange={handleDensityChange}
            name="density-group"
          >
            <CyberRadio.FormControlLabel 
              value="comfortable" 
              label="Comfortable (More spacing)" 
            />
            <CyberRadio.FormControlLabel 
              value="compact" 
              label="Compact (Less spacing)" 
            />
          </CyberRadio.Group>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Font Size
          </Typography>
          <CyberRadio.Group
            label="Text Size"
            value={settings.appearance.fontSize}
            onChange={handleFontSizeChange}
            name="font-size-group"
          >
            <CyberRadio.FormControlLabel value="small" label="Small" />
            <CyberRadio.FormControlLabel value="medium" label="Medium" />
            <CyberRadio.FormControlLabel value="large" label="Large" />
          </CyberRadio.Group>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Template View
          </Typography>
          <CyberRadio.Group
            label="Template List Layout"
            value={settings.appearance.viewMode}
            onChange={handleViewModeChange}
            name="view-mode-group"
            helperText="Changes how templates are displayed on the home page"
          >
            <CyberRadio.FormControlLabel
              value="card"
              label="Card View (Grid layout with template cards)"
            />
            <CyberRadio.FormControlLabel
              value="list"
              label="List View (Compact table-style layout)"
            />
          </CyberRadio.Group>
        </TabPanel>

        {/* Behavior Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Startup Behavior
          </Typography>
          <CyberRadio.Group
            label="Start Application With"
            value={settings.startupPage}
            onChange={handleStartupPageChange}
            name="startup-page-group"
            sx={{ mb: 4 }}
          >
            <CyberRadio.FormControlLabel
              value="home"
              label="Home page (Template List)"
            />
            <CyberRadio.FormControlLabel
              value="last-viewed"
              label="Last viewed page"
            />
          </CyberRadio.Group>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Confirmations
          </Typography>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <CyberSwitch
                  checked={settings.confirmDialogs.deleteTemplate}
                  onChange={handleConfirmDialogChange('deleteTemplate')}
                  scanlineEffect
                />
              }
              label=
              "Ask for confirmation when deleting templates"
            />
          </Box>
          <Box>
            <FormControlLabel
              control={
                <CyberSwitch
                  checked={settings.confirmDialogs.applyTemplate}
                  onChange={handleConfirmDialogChange('applyTemplate')}
                  scanlineEffect
                />
              }
              label="Ask for confirmation when applying templates"
            />
          </Box>
        </TabPanel>

        {/* Help Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" gutterBottom>
            Help & Documentation
          </Typography>

          {/* Getting Started Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<CyberIcon icon={ExpandMore} glowIntensity={0.3} />}>
              <Typography variant="h6">Getting Started</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                <strong>Welcome to Shortcut Shortcut!</strong> This application helps you create and manage templates for epics and stories in Shortcut, streamlining your team's workflow and ensuring consistency.
              </Typography>
              <Typography paragraph>
                <strong>Application Overview:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>Home Screen:</strong> View and manage all your epic templates
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Template Editor:</strong> Create and edit epic templates with customizable stories and tasks
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Template Application:</strong> Apply templates with variable replacement to create actual epics and stories in Shortcut
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Settings:</strong> Configure API connection, appearance, and application behavior
                  </Typography>
                </li>
              </ul>
              <Typography paragraph>
                <strong>To get started:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    Add your Shortcut API token in the General tab of Settings (see API Token Management section for details)
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Create your first template using the "New Template" button in the application header
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Customize your template with epic details, stories, and variables
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Apply templates to create new epics and stories in your Shortcut workspace
                  </Typography>
                </li>
              </ol>
              <Typography paragraph color="text.secondary">
                <strong>Pro Tip:</strong> For best results, plan your template structure before creating it. Consider which fields should be standardized and which should use variables for flexibility.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Templates Section */}
          <Accordion>
            <AccordionSummary expandIcon={<CyberIcon icon={ExpandMore} glowIntensity={0.3} />}>
              <Typography variant="h6">Creating Templates</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                <strong>Create a Template:</strong> Click the "New Template" button in the application header to start creating a new template.
              </Typography>
              <Typography paragraph>
                <strong>Template Structure:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>Epic Information:</strong> Configure name, description, state, owners, planned dates, and objectives
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Stories:</strong> Add multiple story templates with customizable fields:
                    <ul>
                      <li>Name and description</li>
                      <li>Story type (feature, bug, chore)</li>
                      <li>State and workflow state</li>
                      <li>Estimate points</li>
                      <li>Owner assignments</li>
                      <li>Iteration assignment</li>
                    </ul>
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Tasks:</strong> Add tasks to each story with descriptions and completion status
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Variables:</strong> Dynamic placeholders that get replaced when applying a template (format: {'{{variable_name}}'})
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph>
                <strong>Template Management:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>Auto-save:</strong> Templates are automatically saved as you edit them
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Edit:</strong> From the template list, click the edit icon on any template card to modify it
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Duplicate:</strong> Use the duplicate icon to create a copy of an existing template
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Delete:</strong> Remove templates you no longer need with the delete icon
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph>
                <strong>Best Practices:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    Create templates for common initiatives or recurring epic types
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Use descriptive names for templates to easily identify their purpose
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Include all necessary story types and tasks to provide a complete framework
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Create a template naming convention for your team
                  </Typography>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          {/* Variables Section - New Dedicated Section */}
          <Accordion>
            <AccordionSummary expandIcon={<CyberIcon icon={ExpandMore} glowIntensity={0.3} />}>
              <Typography variant="h6">Variable System</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                <strong>Understanding Variables:</strong> Variables are dynamic placeholders in your templates that get replaced with specific values when you apply the template.
              </Typography>
              
              <Typography paragraph>
                <strong>Creating Variables:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    Use double curly braces to define variables: <code>{"{{variable_name}}"}</code>
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Insert variables in epic names, descriptions, story names, descriptions, or tasks
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Variables are automatically detected when you save the template
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    You can also manually add variables in the Variables section of the template editor
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph>
                <strong>Variable Usage Examples:</strong>
              </Typography>
              <Box sx={{ 
                backgroundColor: theme => alpha(theme.palette.background.default, 0.6), 
                p: 2, 
                borderLeft: theme => `3px solid ${theme.palette.primary.main}`,
                mb: 2
              }}>
                <Typography paragraph variant="subtitle2">Epic Name:</Typography>
                <Typography paragraph fontFamily="monospace">
                  &#123;&#123;Feature&#125;&#125; - Implementation
                </Typography>
                
                <Typography paragraph variant="subtitle2">Story Name:</Typography>
                <Typography paragraph fontFamily="monospace">
                  [&#123;&#123;Component&#125;&#125;] Create &#123;&#123;Feature&#125;&#125; functionality
                </Typography>
                
                <Typography paragraph variant="subtitle2">Description:</Typography>
                <Typography paragraph fontFamily="monospace">
                  Implement the &#123;&#123;Feature&#125;&#125; for &#123;&#123;Platform&#125;&#125; with &#123;&#123;Technology&#125;&#125;
                </Typography>
              </Box>
              
              <Typography paragraph>
                <strong>Best Practices:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    Use descriptive variable names that clearly indicate what should be entered
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Keep variable names consistent across templates (e.g., always use "Feature" instead of mixing "Feature" and "FeatureName")
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Use variables for elements that change between instances but keep standard elements fixed
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Consider creating a variable style guide for your team
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph color="text.secondary">
                <strong>Pro Tip:</strong> When creating templates for similar features across different platforms, use variables like &#123;&#123;Platform&#125;&#125; to easily adapt the same template.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Applying Templates Section */}
          <Accordion>
            <AccordionSummary expandIcon={<CyberIcon icon={ExpandMore} glowIntensity={0.3} />}>
              <Typography variant="h6">Applying Templates</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                <strong>Apply a Template:</strong> From the template list, click the "Play" icon on any template card.
              </Typography>
              
              <Typography paragraph>
                <strong>Application Process:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    <strong>Fill Variables:</strong> Enter values for all template variables (these will replace the placeholders in your template)
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Preview Content:</strong> Review the generated epic and stories with your variable values applied
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Create in Shortcut:</strong> Click "Apply Template" to submit the epic and stories to your Shortcut workspace
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Confirmation:</strong> Upon success, you'll see a confirmation message with the created epic ID and number of stories
                  </Typography>
                </li>
              </ol>
              
              <Typography paragraph>
                <strong>What Happens Behind the Scenes:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    The application replaces all variables with your entered values
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    It creates an epic in Shortcut with your specified details
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    It then creates all stories and attaches them to the epic
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Tasks are created and attached to their respective stories
                  </Typography>
                </li>
              </ol>
              
              <Typography paragraph color="text.secondary">
                <strong>Important:</strong> You must have a valid API token set in the Settings page to apply templates. Ensure you have the necessary permissions in your Shortcut workspace to create epics and stories.
              </Typography>
              
              <Typography paragraph color="text.secondary">
                <strong>Pro Tip:</strong> You can verify the created epic and stories by clicking on the link in the success message or by checking your Shortcut workspace.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Import & Export Section */}
          <Accordion>
            <AccordionSummary expandIcon={<CyberIcon icon={ExpandMore} glowIntensity={0.3} />}>
              <Typography variant="h6">Import & Export Templates</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                <strong>Template Sharing:</strong> Easily share your templates with teammates or across workspaces using the import/export functionality.
              </Typography>
              
              <Typography paragraph>
                <strong>Exporting Templates:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    Navigate to the Templates list page
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Click the "Export" button in the upper right corner
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Choose a location to save the JSON file containing all your templates
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Share this file with teammates or save it as a backup
                  </Typography>
                </li>
              </ol>
              
              <Typography paragraph>
                <strong>Importing Templates:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    Navigate to the Templates list page
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Click the "Import" button in the upper right corner
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Select a previously exported JSON file from your file system
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    The application will merge these templates with your existing collection
                  </Typography>
                </li>
              </ol>
              
              <Typography paragraph>
                <strong>Team Collaboration Strategies:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    Create a shared repository of template JSON files for your team
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Version your template files with dates or version numbers
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Document the purpose and structure of shared templates
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Consider creating role-specific or project-specific template collections
                  </Typography>
                </li>
              </ul>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Important:</strong> When importing templates, any templates with the same ID as existing templates will overwrite the existing ones. Templates with unique IDs will be added to your collection.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Pro Tip:</strong> If you want to share only specific templates, export them all first, then edit the JSON file to remove the templates you don't want to share before distributing it.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* API Token Section */}
          <Accordion>
            <AccordionSummary expandIcon={<CyberIcon icon={ExpandMore} glowIntensity={0.3} />}>
              <Typography variant="h6">API Token Management</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                <strong>About Shortcut API Tokens:</strong> API tokens provide secure access to your Shortcut workspace. This application requires an API token to create epics and stories on your behalf.
              </Typography>
              
              <Typography paragraph>
                <strong>Getting a Shortcut API Token:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    Log in to your Shortcut account in a web browser
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Navigate to Settings → API Tokens (or go directly to https://app.shortcut.com/[your-organization]/settings/account/api-tokens)
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Click "Generate Token" and provide a description (e.g., "Shortcut Shortcut App")
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Copy the generated token (important: you won't be able to see it again)
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Paste the token into the API Token field in the General tab of Settings
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Click "Validate & Save Token" to verify and store your token
                  </Typography>
                </li>
              </ol>
              
              <Typography paragraph>
                <strong>Token Security:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    Your API token is stored securely on your local device only
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    The token is never transmitted to any server other than Shortcut's official API
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    The application communicates with Shortcut using HTTPS encryption
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    You can revoke the token at any time from your Shortcut account settings
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph>
                <strong>Token Permissions:</strong>
              </Typography>
              <Typography paragraph>
                Shortcut API tokens have full access to your workspace. The application uses this access to:
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    Fetch workspace data (projects, workflows, members, etc.)
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Create new epics and stories
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Validate authentication
                  </Typography>
                </li>
              </ul>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Important:</strong> Your API token grants access to your Shortcut workspace, so keep it secure and never share it with unauthorized users. If you suspect your token has been compromised, immediately revoke it in your Shortcut account and generate a new one.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Troubleshooting Section */}
          <Accordion>
            <AccordionSummary expandIcon={<CyberIcon icon={ExpandMore} glowIntensity={0.3} />}>
              <Typography variant="h6">Troubleshooting</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                <strong>Common Issues and Solutions:</strong>
              </Typography>
              
              <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                API and Authentication Issues
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>API Token Invalid:</strong> Ensure your token is correctly entered without extra spaces. Try regenerating a new token in Shortcut if problems persist.
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>API Connection Failed:</strong> Check your internet connection. If you're using a VPN or corporate firewall, ensure it allows connections to the Shortcut API (api.app.shortcut.com).
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>API Rate Limiting:</strong> If you're making many requests in a short time, you might hit rate limits. Wait a few minutes and try again.
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Template Creation and Management
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>Template Not Saving:</strong> Ensure the epic name field is filled out (it's required). Check that you have sufficient disk space.
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Variable Extraction Issues:</strong> Make sure variables use the correct format: &#123;&#123;variable_name&#125;&#125;. Check for typos or mismatched braces.
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Missing Templates:</strong> Templates are stored locally. If they've disappeared, check if you've switched computers or user accounts.
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Template Application Issues
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>Cannot Create Epic:</strong> Verify you have sufficient permissions in your Shortcut workspace. Some workspaces restrict who can create epics.
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Workflow State Errors:</strong> If you see errors about invalid workflow states, ensure you're selecting the correct workflow. Workflow states are specific to each workflow.
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Owner Assignment Failures:</strong> Ensure the members you're trying to assign as owners exist in your workspace and that you're using their correct IDs.
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                Import/Export Issues
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>Import Failing:</strong> Verify the import file is a valid JSON file exported from this application. If you've manually edited the file, check for syntax errors.
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Export Not Working:</strong> Ensure you have write permissions to the location where you're trying to save the export file.
                  </Typography>
                </li>
              </ul>
              
              <Typography paragraph>
                <strong>Advanced Troubleshooting:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>Clear Application Cache:</strong> Use the Cache Monitor panel to clear cached API responses if you're seeing stale data.
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Reset Templates:</strong> If experiencing persistent issues, try exporting your templates as a backup, then deleting and reimporting them to reset your local storage.
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Application Restart:</strong> If all else fails, try restarting the application to resolve any temporary runtime issues.
                  </Typography>
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          
          {/* Cache Monitor Section */}
          <Accordion>
            <AccordionSummary expandIcon={<CyberIcon icon={ExpandMore} glowIntensity={0.3} />}>
              <Typography variant="h6">Cache Monitor</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CacheMonitorPanel />
            </AccordionDetails>
          </Accordion>
        </TabPanel>
      </CyberCard>
    </Box>
  );
};

export default Settings;

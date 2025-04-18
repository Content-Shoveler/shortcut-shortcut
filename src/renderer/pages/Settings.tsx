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
} from '@mui/material';
import { Visibility, VisibilityOff, ExpandMore } from '@mui/icons-material';
import { useTheme, useSettings } from '../store/AppProviders';
import { useValidateToken } from '../hooks/useShortcutApi';
import { 
  CyberCard, 
  CyberTextField, 
  CyberButton, 
  CyberSwitch, 
  CyberTabs, 
  CyberRadio,
  CyberIcon
} from '../components/cyberpunk';

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
  const { settings, updateSettings, updateApiToken } = useSettings();
  const { validateToken, loading: validatingToken } = useValidateToken();
  
  const [tabValue, setTabValue] = useState(0);
  const [apiToken, setApiToken] = useState(settings.apiToken);
  const [showApiToken, setShowApiToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{ valid: boolean | null; message: string }>({
    valid: null,
    message: '',
  });

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle API token changes
  const handleApiTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiToken(event.target.value);
    // Reset validation when token changes
    if (tokenStatus.valid !== null) {
      setTokenStatus({ valid: null, message: '' });
    }
  };

  // Validate API token
  const handleValidateToken = async () => {
    try {
      const isValid = await validateToken(apiToken);
      setTokenStatus({
        valid: isValid,
        message: isValid
          ? 'Token is valid.'
          : 'Token is invalid or could not be validated.',
      });
      
      if (isValid) {
        updateApiToken(apiToken);
      }
    } catch (error) {
      setTokenStatus({
        valid: false,
        message: 'An error occurred while validating the token.',
      });
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
              disabled={!apiToken || validatingToken}
              sx={{ mt: 1 }}
              scanlineEffect
              glowIntensity={0.7}
            >
              {validatingToken ? <CircularProgress size={24} /> : 'Validate & Save Token'}
            </CyberButton>

            {tokenStatus.valid !== null && (
              <Alert
                severity={tokenStatus.valid ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {tokenStatus.message}
              </Alert>
            )}
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
              label="Ask for confirmation when deleting templates"
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
                <strong>Welcome to Shortcut Epic Templates!</strong> This application helps you create and manage templates for epics and stories in Shortcut.
              </Typography>
              <Typography paragraph>
                <strong>To get started:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    Add your Shortcut API token in the General tab of Settings
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Create your first template using the "New Template" button in the header
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Apply templates to create new epics and stories in your Shortcut workspace
                  </Typography>
                </li>
              </ol>
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
                <strong>Template Components:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>Epic Information:</strong> Basic information like name, description, state, and project for the epic
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Variables:</strong> Placeholders that get replaced when applying a template (format: {'{'}{'{'}'variable_name{'}'}{'}'})
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Stories:</strong> Individual story templates that will be created within the epic
                  </Typography>
                </li>
              </ul>
              <Typography paragraph>
                <strong>Variables Usage:</strong> Use variables to make templates reusable across different contexts. For example, {'{'}{'{'}'project_name{'}'}{'}'}  could be used in story titles and descriptions.
              </Typography>
              <Typography paragraph>
                <strong>Edit Templates:</strong> From the template list, click the edit icon on any template card to modify it.
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
                <strong>Workflow:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    Enter values for all template variables
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Select the project and workflow for the new epic
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Review the generated epic and stories
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Click "Create in Shortcut" to submit to your Shortcut workspace
                  </Typography>
                </li>
              </ol>
              <Typography variant="body2" color="text.secondary">
                Note: You must have a valid API token set in the Settings page to apply templates.
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
                <strong>Exporting Templates:</strong> Click the "Export" button on the templates list page to save your templates to a JSON file.
                This file can be shared with team members or used as a backup.
              </Typography>
              <Typography paragraph>
                <strong>Importing Templates:</strong> Click the "Import" button on the templates list page and select a previously exported JSON file.
                The app will load these templates into your local collection.
              </Typography>
              <Typography paragraph>
                <strong>Team Collaboration:</strong> Export your templates and share the JSON file with teammates. They can import the file to have the same templates available.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Note: Importing templates with the same ID as existing templates will overwrite them.
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
                <strong>Getting a Shortcut API Token:</strong>
              </Typography>
              <ol>
                <li>
                  <Typography paragraph>
                    Log in to your Shortcut account
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Go to Settings → API Tokens
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Create a new API token (or use an existing one)
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    Copy the token and paste it into the API Token field in the General tab of Settings
                  </Typography>
                </li>
              </ol>
              <Typography paragraph>
                <strong>Security:</strong> Your API token is stored locally on your computer and is never shared. It is used only to communicate with the Shortcut API.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Note: Your API token grants access to your Shortcut workspace, so keep it secure.
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
                <strong>Common Issues:</strong>
              </Typography>
              <ul>
                <li>
                  <Typography paragraph>
                    <strong>API Token Invalid:</strong> Ensure your API token is correctly entered and has not expired
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Cannot Create Epic:</strong> Check that you have permissions to create epics in the selected project
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Template Not Saving:</strong> Ensure all required fields are filled out
                  </Typography>
                </li>
                <li>
                  <Typography paragraph>
                    <strong>Import Failing:</strong> Verify that the import file is a valid JSON file exported from this application
                  </Typography>
                </li>
              </ul>
              <Typography paragraph>
                <strong>Resetting:</strong> If you're experiencing persistent issues, try clearing your saved templates by exporting them first (as a backup), then deleting them, and finally importing them back.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </TabPanel>
      </CyberCard>
    </Box>
  );
};

export default Settings;

import { app, BrowserWindow, ipcMain, dialog, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import axios from 'axios';

// Define the interface for our templates
interface Template {
  id: string;
  name: string;
  description: string;
  epicDetails: {
    name: string;
    description: string;
    state: string;
  };
  storyTemplates: Array<{
    name: string;
    description: string;
    type: string;
    state: string;
    estimate?: number;
    labels?: string[];
    owner_ids?: string[];
    iteration_id?: number;
  }>;
  variables: string[];
}

// Initialize the electron-store
// We have to use 'any' because the type definitions for electron-store
// have issues with TypeScript strict mode
const store = new Store() as any;

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

function createSplashWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  // Create splash window
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    center: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Position the window in the center of the screen
  splashWindow.center();
  
  // Load the splash screen HTML
  const splashPath = app.isPackaged 
    ? path.join(app.getAppPath(), 'dist', 'splash.html')
    : path.join(app.getAppPath(), 'public', 'splash.html');
  
  splashWindow.loadFile(splashPath);
  
  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
  });
  
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createWindow() {
  // Create the browser window but don't show it yet
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until content is loaded
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: false,
    },
    backgroundColor: '#121212', // Set background color to match theme
  });

  // Wait for content to be ready before showing the window
  mainWindow.once('ready-to-show', () => {
    // Close splash and show main window
    if (splashWindow) {
      splashWindow.close();
    }
    mainWindow?.show();
  });

  // Load the app
  // Check if we're in development mode by looking for app.isPackaged
  // which is automatically set by Electron in packaged builds
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:9000');
    // Open DevTools only in development mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production, we need to look in the correct location for index.html
    const appPath = app.getAppPath();
    const indexPath = path.join(appPath, 'dist', 'index.html');
    console.log(`Loading app from: ${indexPath}`);
    mainWindow.loadFile(indexPath);
    
    // Add error handling for loading failures
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load application:', errorCode, errorDescription);
    });
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Shortcut API Client functions
const SHORTCUT_API_URL = 'https://api.app.shortcut.com/api/v3';

// Create axios instance for the Shortcut API
const createShortcutClient = (apiToken: string) => {
  return axios.create({
    baseURL: SHORTCUT_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Shortcut-Token': apiToken
    }
  });
};

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      success: false,
      status: error.response.status,
      message: error.response.data?.message || `API Error: ${error.response.status}`,
      data: error.response.data
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'No response received from Shortcut API',
    };
  } else {
    // Something happened in setting up the request
    return {
      success: false,
      message: error.message || 'Unknown error occurred',
    };
  }
};

// Set up global error handlers for the main process
app.on('render-process-gone', (event, webContents, details) => {
  console.error('Renderer process gone:', details.reason, details.exitCode);
  console.error('Renderer process details:', details);
});

// Error handler for unhandled exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in main process:', error);
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // First show splash window
  createSplashWindow();
  // Then initialize main window
  createWindow();
  
  // Log app directory information to help with debugging
  if (app.isPackaged) {
    console.log('App is running in packaged mode');
    console.log('App path:', app.getAppPath());
    console.log('__dirname:', __dirname);
  }

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });
}).catch(error => {
  console.error('Failed to initialize application:', error);
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for templates
ipcMain.handle('getTemplates', () => {
  return store.get('templates', []);
});

ipcMain.handle('saveTemplate', (_, template: Template) => {
  const templates = store.get('templates', []) as Template[];
  const index = templates.findIndex((t: Template) => t.id === template.id);
  
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  
  store.set('templates', templates);
  return template;
});

ipcMain.handle('deleteTemplate', (_, templateId: string) => {
  const templates = store.get('templates', []) as Template[];
  const filteredTemplates = templates.filter((t: Template) => t.id !== templateId);
  
  store.set('templates', filteredTemplates);
  return templateId;
});

ipcMain.handle('exportTemplates', async () => {
  const templates = store.get('templates', []);
  
  const { filePath } = await dialog.showSaveDialog({
    title: 'Export Templates',
    defaultPath: 'shortcut-templates.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  
  if (filePath) {
    fs.writeFileSync(filePath, JSON.stringify(templates, null, 2));
    return true;
  }
  
  return false;
});

ipcMain.handle('importTemplates', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Import Templates',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  
  if (filePaths && filePaths.length > 0) {
    try {
      const data = fs.readFileSync(filePaths[0], 'utf8');
      const importedTemplates = JSON.parse(data) as Template[];
      
      const currentTemplates = store.get('templates', []) as Template[];
      
      // Merge templates, overwriting existing ones with the same ID
      const mergedTemplates = [...currentTemplates];
      
      importedTemplates.forEach((importedTemplate: Template) => {
        const index = mergedTemplates.findIndex((t: Template) => t.id === importedTemplate.id);
        if (index >= 0) {
          mergedTemplates[index] = importedTemplate;
        } else {
          mergedTemplates.push(importedTemplate);
        }
      });
      
      store.set('templates', mergedTemplates);
      return mergedTemplates;
    } catch (error) {
      throw new Error('Failed to import templates');
    }
  }
  
  return null;
});

// Shortcut API handlers

// Validate API token
ipcMain.handle('shortcut-validateToken', async (_, apiToken: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/member');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
});

// Fetch members (for owner selection)
ipcMain.handle('shortcut-fetchMembers', async (_, apiToken: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/members');
    
    // Log the entire response for debugging
    console.log('Members API response count:', response.data.length);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching members:', error);
    return handleApiError(error);
  }
});

// Fetch labels
ipcMain.handle('shortcut-fetchLabels', async (_, apiToken: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    // Using slim=true to get only essential label data
    const response = await client.get('/labels?slim=true');
    
    console.log('Labels API response count:', response.data.length);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching labels:', error);
    return handleApiError(error);
  }
});

// Fetch objectives
ipcMain.handle('shortcut-fetchObjectives', async (_, apiToken: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/objectives');
    
    console.log('Objectives API response count:', response.data.length);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return handleApiError(error);
  }
});

// Fetch iterations
ipcMain.handle('shortcut-fetchIterations', async (_, apiToken: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/iterations');
    
    console.log('Iterations API response count:', response.data.length);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching iterations:', error);
    return handleApiError(error);
  }
});

ipcMain.handle('shortcut-fetchProjects', async (_, apiToken: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/projects');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
});

ipcMain.handle('shortcut-fetchWorkflows', async (_, apiToken: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/workflows');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
});

ipcMain.handle('shortcut-fetchWorkflowStates', async (_, apiToken: string, workflowId: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  console.log(`Fetching workflow states for workflow ID: ${workflowId}`);
  
  try {
    const client = createShortcutClient(apiToken);
    // Get the workflow data which includes states
    const response = await client.get(`/workflows/${workflowId}`);
    
    // Log the entire response for debugging
    console.log('Full workflow API response:', JSON.stringify(response.data, null, 2));
    
    // Extract states from the workflow response
    if (response.data && Array.isArray(response.data.states)) {
      console.log(`Found ${response.data.states.length} states in workflow ${workflowId}`);
      console.log('States:', JSON.stringify(response.data.states, null, 2));
      return { success: true, data: response.data.states };
    } else {
      console.log('No states array found in workflow response:', response.data);
      return { success: true, data: [] }; // Return empty array if no states
    }
  } catch (error) {
    console.error('Error fetching workflow states:', error);
    return handleApiError(error);
  }
});

ipcMain.handle('shortcut-fetchEpicWorkflow', async (_, apiToken: string) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  console.log('Fetching epic workflow');
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/epic-workflow');
    
    // Log the entire response for debugging
    console.log('Epic workflow API response:', JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching epic workflow:', error);
    return handleApiError(error);
  }
});

ipcMain.handle('shortcut-createEpic', async (_, apiToken: string, epicData: any) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    // Log what we're sending to the API for debugging
    console.log('Creating epic with payload:', JSON.stringify(epicData, null, 2));
    
    // Log specific fields we're troubleshooting
    if (epicData.owner_ids) {
      console.log('Owner IDs format:', JSON.stringify(epicData.owner_ids), 'Type:', Array.isArray(epicData.owner_ids) ? 'Array' : typeof epicData.owner_ids);
    }
    
    if (epicData.labels) {
      console.log('Labels format:', JSON.stringify(epicData.labels), 'Type:', Array.isArray(epicData.labels) ? 'Array' : typeof epicData.labels);
    }
    
    if (epicData.objective_ids) {
      console.log('Objective IDs format:', JSON.stringify(epicData.objective_ids), 'Type:', Array.isArray(epicData.objective_ids) ? 'Array' : typeof epicData.objective_ids);
    }
    
    const client = createShortcutClient(apiToken);
    const response = await client.post('/epics', epicData);
    
    console.log('Epic created successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error creating epic:', error);
    
    // Enhanced error handling with more details
    if (error.response && error.response.data) {
      console.error('API error response status:', error.response.status);
      console.error('API error details:', JSON.stringify(error.response.data, null, 2));
      
      // Check for specific field errors
      if (error.response.data.errors) {
        const errorFields = Object.keys(error.response.data.errors);
        console.error('Fields with errors:', errorFields);
        errorFields.forEach(field => {
          console.error(`${field} errors:`, error.response.data.errors[field]);
        });
      }
    }
    
    return handleApiError(error);
  }
});

ipcMain.handle('shortcut-createStory', async (_, apiToken: string, storyData: any) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    // Log what we're sending to the API for debugging
    console.log('Creating story with payload:', JSON.stringify(storyData, null, 2));
    
    // Log specific fields we're troubleshooting
    if (storyData.owner_ids) {
      console.log('Owner IDs format:', JSON.stringify(storyData.owner_ids), 'Type:', Array.isArray(storyData.owner_ids) ? 'Array' : typeof storyData.owner_ids);
    }
    
    if (storyData.labels) {
      console.log('Labels format:', JSON.stringify(storyData.labels), 'Type:', Array.isArray(storyData.labels) ? 'Array' : typeof storyData.labels);
    }
    
    const client = createShortcutClient(apiToken);
    const response = await client.post('/stories', storyData);
    
    console.log('Story created successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error creating story:', error);
    
    // Enhanced error handling with more details
    if (error.response && error.response.data) {
      console.error('API error response status:', error.response.status);
      console.error('API error details:', JSON.stringify(error.response.data, null, 2));
      
      // Check for specific field errors
      if (error.response.data.errors) {
        const errorFields = Object.keys(error.response.data.errors);
        console.error('Fields with errors:', errorFields);
        errorFields.forEach(field => {
          console.error(`${field} errors:`, error.response.data.errors[field]);
        });
      }
    }
    
    return handleApiError(error);
  }
});

ipcMain.handle('shortcut-createMultipleStories', async (_, apiToken: string, storiesData: any[]) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    // Log what we're sending to the API for debugging
    console.log('Creating multiple stories with payload:', JSON.stringify({ stories: storiesData }, null, 2));
    console.log(`Number of stories to create: ${storiesData.length}`);
    
    const client = createShortcutClient(apiToken);
    const response = await client.post('/stories/bulk', { stories: storiesData });
    
    console.log(`Successfully created ${response.data.length} stories`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error creating multiple stories:', error);
    
    // Enhanced error handling with more details
    if (error.response && error.response.data) {
      console.error('API error response status:', error.response.status);
      console.error('API error details:', JSON.stringify(error.response.data, null, 2));
      
      // Check for specific field errors
      if (error.response.data.errors) {
        const errorFields = Object.keys(error.response.data.errors);
        console.error('Fields with errors:', errorFields);
        errorFields.forEach(field => {
          console.error(`${field} errors:`, error.response.data.errors[field]);
        });
      }
    }
    
    return handleApiError(error);
  }
});

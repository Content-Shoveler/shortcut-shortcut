import { app, BrowserWindow, ipcMain, dialog } from 'electron';
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
  }>;
  variables: string[];
}

// Initialize the electron-store
// We have to use 'any' because the type definitions for electron-store
// have issues with TypeScript strict mode
const store = new Store() as any;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: false,
    },
  });

  // Load the app
  // Check if we're in development mode by looking for app.isPackaged
  // which is automatically set by Electron in packaged builds
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:9000');
    // Open DevTools only in development mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
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

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });
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
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get(`/workflows/${workflowId}/states`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
});

ipcMain.handle('shortcut-createEpic', async (_, apiToken: string, epicData: any) => {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    // Log what we're sending to the API for debugging
    console.log('Creating epic with payload:', JSON.stringify(epicData));
    
    // Ensure we're sending a pure JSON object with string properties
    const simplifiedPayload = {
      name: String(epicData.name || 'New Epic')
    };
    
    console.log('Simplified payload:', JSON.stringify(simplifiedPayload));
    
    const client = createShortcutClient(apiToken);
    const response = await client.post('/epics', simplifiedPayload);
    
    console.log('Epic created successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error creating epic:', error);
    
    // Enhanced error handling with more details
    if (error.response && error.response.data) {
      console.error('API error details:', error.response.data);
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
    console.log('Creating story with payload:', JSON.stringify(storyData));
    
    const client = createShortcutClient(apiToken);
    const response = await client.post('/stories', storyData);
    
    console.log('Story created successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error creating story:', error);
    
    // Enhanced error handling with more details
    if (error.response && error.response.data) {
      console.error('API error details:', error.response.data);
    }
    
    return handleApiError(error);
  }
});

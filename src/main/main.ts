import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';

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

// IPC handlers
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
      console.error('Failed to import templates:', error);
      throw new Error('Failed to import templates');
    }
  }
  
  return null;
});

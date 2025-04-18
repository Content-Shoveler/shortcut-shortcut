import { contextBridge, ipcRenderer } from 'electron';

// Define the template interface for TypeScript
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

// Define the ElectronAPI interface
interface ElectronAPI {
  getTemplates: () => Promise<Template[]>;
  saveTemplate: (template: Template) => Promise<Template>;
  deleteTemplate: (templateId: string) => Promise<string>;
  exportTemplates: () => Promise<boolean>;
  importTemplates: () => Promise<Template[] | null>;
  
  // API token management
  getApiToken: () => Promise<string>;
  setApiToken: (token: string) => Promise<boolean>;
  validateApiToken: (token: string) => Promise<boolean>;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Template management
  getTemplates: () => ipcRenderer.invoke('getTemplates'),
  saveTemplate: (template: Template) => ipcRenderer.invoke('saveTemplate', template),
  deleteTemplate: (templateId: string) => ipcRenderer.invoke('deleteTemplate', templateId),
  
  // Import/Export
  exportTemplates: () => ipcRenderer.invoke('exportTemplates'),
  importTemplates: () => ipcRenderer.invoke('importTemplates'),
  
  // API token management
  getApiToken: () => ipcRenderer.invoke('getApiToken'),
  setApiToken: (token: string) => ipcRenderer.invoke('setApiToken', token),
  validateApiToken: (token: string) => ipcRenderer.invoke('validateApiToken', token),
} as ElectronAPI);

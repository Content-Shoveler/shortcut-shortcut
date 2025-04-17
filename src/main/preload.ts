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
} as ElectronAPI);

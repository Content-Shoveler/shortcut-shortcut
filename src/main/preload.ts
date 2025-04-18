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

// Define the ShortcutApiResponse interface for consistent api responses
interface ShortcutApiResponse<T = any> {
  success: boolean;
  message?: string;
  status?: number;
  data?: T;
}

// Define the ElectronAPI interface
interface ElectronAPI {
  // Template management
  getTemplates: () => Promise<Template[]>;
  saveTemplate: (template: Template) => Promise<Template>;
  deleteTemplate: (templateId: string) => Promise<string>;
  exportTemplates: () => Promise<boolean>;
  importTemplates: () => Promise<Template[] | null>;
  
  // Shortcut API
  shortcutApi: {
    validateToken: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchProjects: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchWorkflows: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchWorkflowStates: (apiToken: string, workflowId: string) => Promise<ShortcutApiResponse>;
    createEpic: (apiToken: string, epicData: any) => Promise<ShortcutApiResponse>;
    createStory: (apiToken: string, storyData: any) => Promise<ShortcutApiResponse>;
  };
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
  
  // Shortcut API
  shortcutApi: {
    validateToken: (apiToken: string) => 
      ipcRenderer.invoke('shortcut-validateToken', apiToken),
    fetchProjects: (apiToken: string) => 
      ipcRenderer.invoke('shortcut-fetchProjects', apiToken),
    fetchWorkflows: (apiToken: string) => 
      ipcRenderer.invoke('shortcut-fetchWorkflows', apiToken),
    fetchWorkflowStates: (apiToken: string, workflowId: string) => 
      ipcRenderer.invoke('shortcut-fetchWorkflowStates', apiToken, workflowId),
    createEpic: (apiToken: string, epicData: any) => 
      ipcRenderer.invoke('shortcut-createEpic', apiToken, epicData),
    createStory: (apiToken: string, storyData: any) => 
      ipcRenderer.invoke('shortcut-createStory', apiToken, storyData),
  },
} as ElectronAPI);

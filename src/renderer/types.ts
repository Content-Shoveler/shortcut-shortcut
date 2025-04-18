// Template interfaces
export interface Template {
  id: string;
  name: string;
  description: string;
  epicDetails: EpicDetails;
  storyTemplates: StoryTemplate[];
  variables: string[];
}

export interface EpicDetails {
  name: string;
  description: string;
  state: string;
}

export interface StoryTemplate {
  name: string;
  description: string;
  type: string;
  state: string;
  workflow_id?: string;
  workflow_state_id?: string;
  estimate?: number;
  labels?: string[];
}

// For variable replacement in templates
export interface VariableMapping {
  [key: string]: string;
}

// For Shortcut API integration
export interface ShortcutCredentials {
  apiToken: string;
}

// Electron API interface
export interface ElectronAPI {
  getTemplates: () => Promise<Template[]>;
  saveTemplate: (template: Template) => Promise<Template>;
  deleteTemplate: (templateId: string) => Promise<string>;
  exportTemplates: () => Promise<boolean>;
  importTemplates: () => Promise<Template[] | null>;
}

// Declare global window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

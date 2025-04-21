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
  epic_state_id?: number;
  owner_ids?: string[];
  planned_start_date?: string;
  deadline?: string;
  objective_ids?: number[];
  group_ids?: string[];
}

export interface StoryTemplate {
  name: string;
  description: string;
  type: string;
  state: string;
  workflow_id?: string;
  workflow_state_id?: string;
  estimate?: number;
  owner_ids?: string[];
  iteration_id?: string;
  tasks?: TaskTemplate[]; // Added tasks array
}

// New interface for task templates
export interface TaskTemplate {
  description: string;
  complete: boolean;
  owner_ids?: string[];
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

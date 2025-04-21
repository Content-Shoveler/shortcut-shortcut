import { Template } from '../types';

export interface ShortcutApiResponse<T = any> {
  success: boolean;
  message?: string;
  status?: number;
  data?: T;
}

export interface ElectronAPI {
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
    fetchEpicWorkflow: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchMembers: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchLabels: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchObjectives: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchGroups: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchIterations: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchWorkspaceInfo: (apiToken: string) => Promise<ShortcutApiResponse>;
    createEpic: (apiToken: string, epicData: any) => Promise<ShortcutApiResponse>;
    createStory: (apiToken: string, storyData: any) => Promise<ShortcutApiResponse>;
    createMultipleStories: (apiToken: string, storiesData: any[]) => Promise<ShortcutApiResponse>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

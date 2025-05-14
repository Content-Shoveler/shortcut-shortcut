/**
 * Shortcut API Service Interface
 * 
 * This file defines the interface for the Shortcut API service and
 * provides a factory function to create the appropriate implementation
 * based on the current environment.
 */

import { 
  ShortcutProject, 
  ShortcutWorkflow, 
  ShortcutWorkflowState 
} from '../../types/shortcutApi';
import { isElectron } from '../../utils/environment';

/**
 * Interface for all Shortcut API operations
 */
export interface ShortcutApiService {
  // Token validation
  validateToken: (apiToken: string) => Promise<boolean>;
  
  // Data fetching methods
  fetchProjects: (apiToken: string) => Promise<ShortcutProject[]>;
  fetchWorkflows: (apiToken: string) => Promise<ShortcutWorkflow[]>;
  fetchWorkflowStates: (apiToken: string, workflowId: string) => Promise<ShortcutWorkflowState[]>;
  fetchEpicWorkflow: (apiToken: string) => Promise<any>;
  fetchMembers: (apiToken: string) => Promise<any[]>;
  fetchLabels: (apiToken: string) => Promise<any[]>;
  fetchObjectives: (apiToken: string) => Promise<any[]>;
  fetchGroups: (apiToken: string) => Promise<any[]>;
  fetchIterations: (apiToken: string) => Promise<any[]>;
  fetchWorkspaceInfo: (apiToken: string) => Promise<any>;
  
  // Creation methods
  createEpic: (apiToken: string, epicData: any) => Promise<any>;
  createStory: (apiToken: string, storyData: any) => Promise<any>;
  createMultipleStories: (apiToken: string, storiesData: any[]) => Promise<any[]>;
}

/**
 * Factory function to create the appropriate API service implementation
 * based on the current environment.
 */
export const createShortcutApiService = (): ShortcutApiService => {
  // Dynamic imports to avoid loading unnecessary code
  if (isElectron()) {
    // Using require here to avoid webpack trying to include both implementations
    // in the bundle when only one is needed
    const { ElectronShortcutApiService } = require('./ElectronShortcutApiService');
    return new ElectronShortcutApiService();
  } else {
    const { WebShortcutApiService } = require('./WebShortcutApiService');
    return new WebShortcutApiService();
  }
};

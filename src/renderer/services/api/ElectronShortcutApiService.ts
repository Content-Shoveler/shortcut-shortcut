/**
 * Electron implementation of the Shortcut API Service
 * 
 * This implementation uses the Electron IPC bridge to communicate
 * with the main process, which handles the actual API calls.
 */

import { 
  ShortcutProject, 
  ShortcutWorkflow, 
  ShortcutWorkflowState 
} from '../../types/shortcutApi';
import { ShortcutApiResponse } from '../../types/electron';
import { ShortcutApiService } from './ShortcutApiService';
import { getElectronAPI } from '../../utils/environment';

// Helper type for the Electron API with shortcutApi
type ShortcutElectronAPI = {
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
};

/**
 * Implementation of the Shortcut API Service for Electron environment
 * This simply wraps the existing Electron IPC bridge methods
 */
export class ElectronShortcutApiService implements ShortcutApiService {
  private getAPI(): ShortcutElectronAPI {
    const api = window.electronAPI as any;
    return api;
  }

  async validateToken(apiToken: string): Promise<boolean> {
    try {
      const api = this.getAPI();
      const response = await api.shortcutApi.validateToken(apiToken);
      return response.success;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  async fetchProjects(apiToken: string): Promise<ShortcutProject[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchProjects(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch projects');
    }
    
    return response.data || [];
  }

  async fetchWorkflows(apiToken: string): Promise<ShortcutWorkflow[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchWorkflows(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workflows');
    }
    
    return response.data || [];
  }

  async fetchWorkflowStates(apiToken: string, workflowId: string): Promise<ShortcutWorkflowState[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchWorkflowStates(apiToken, workflowId);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workflow states');
    }
    
    return response.data || [];
  }

  async fetchEpicWorkflow(apiToken: string): Promise<any> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchEpicWorkflow(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch epic workflow');
    }
    
    return response.data || null;
  }

  async fetchMembers(apiToken: string): Promise<any[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchMembers(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch members');
    }
    
    return response.data || [];
  }

  async fetchLabels(apiToken: string): Promise<any[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchLabels(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch labels');
    }
    
    return response.data || [];
  }

  async fetchObjectives(apiToken: string): Promise<any[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchObjectives(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch objectives');
    }
    
    return response.data || [];
  }

  async fetchGroups(apiToken: string): Promise<any[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchGroups(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch groups');
    }
    
    return response.data || [];
  }

  async fetchIterations(apiToken: string): Promise<any[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchIterations(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch iterations');
    }
    
    return response.data || [];
  }

  async fetchWorkspaceInfo(apiToken: string): Promise<any> {
    const api = this.getAPI();
    const response = await api.shortcutApi.fetchWorkspaceInfo(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workspace info');
    }
    
    return response.data || null;
  }

  async createEpic(apiToken: string, epicData: any): Promise<any> {
    const api = this.getAPI();
    const response = await api.shortcutApi.createEpic(apiToken, epicData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create epic');
    }
    
    return response.data;
  }

  async createStory(apiToken: string, storyData: any): Promise<any> {
    const api = this.getAPI();
    const response = await api.shortcutApi.createStory(apiToken, storyData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create story');
    }
    
    return response.data;
  }

  async createMultipleStories(apiToken: string, storiesData: any[]): Promise<any[]> {
    const api = this.getAPI();
    const response = await api.shortcutApi.createMultipleStories(apiToken, storiesData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create multiple stories');
    }
    
    return response.data || [];
  }
}

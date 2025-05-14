/**
 * Web implementation of the Shortcut API Service
 * 
 * This implementation makes direct API calls to the Shortcut API
 * from the browser environment using the fetch API.
 */

import { 
  ShortcutProject, 
  ShortcutWorkflow, 
  ShortcutWorkflowState 
} from '../../types/shortcutApi';
import { ShortcutApiService } from './ShortcutApiService';

// Shortcut API URL
const SHORTCUT_API_URL = 'https://api.app.shortcut.com/api/v3';

/**
 * Implementation of the Shortcut API Service for web environment
 * Makes direct API calls to the Shortcut API
 */
export class WebShortcutApiService implements ShortcutApiService {
  /**
   * Helper method to make API requests with proper headers
   */
  private async makeRequest(
    endpoint: string, 
    apiToken: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    const url = `${SHORTCUT_API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Shortcut-Token': apiToken
    };

    const options: RequestInit = {
      method,
      headers,
      credentials: 'same-origin',
      mode: 'cors'
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        throw {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
      }
      
      // Handle empty responses
      if (response.status === 204) {
        return null;
      }
      
      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`Error in ${method} request to ${endpoint}:`, error);
      throw error;
    }
  }

  async validateToken(apiToken: string): Promise<boolean> {
    try {
      // Simply try to fetch the current member info
      await this.makeRequest('/member', apiToken);
      return true;
    } catch (error: any) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  async fetchProjects(apiToken: string): Promise<ShortcutProject[]> {
    try {
      return await this.makeRequest('/projects', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch projects: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchWorkflows(apiToken: string): Promise<ShortcutWorkflow[]> {
    try {
      return await this.makeRequest('/workflows', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch workflows: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchWorkflowStates(apiToken: string, workflowId: string): Promise<ShortcutWorkflowState[]> {
    try {
      const workflow = await this.makeRequest(`/workflows/${workflowId}`, apiToken);
      return workflow.states || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch workflow states: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchEpicWorkflow(apiToken: string): Promise<any> {
    try {
      return await this.makeRequest('/epic-workflow', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch epic workflow: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchMembers(apiToken: string): Promise<any[]> {
    try {
      return await this.makeRequest('/members', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch members: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchLabels(apiToken: string): Promise<any[]> {
    try {
      return await this.makeRequest('/labels?slim=true', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch labels: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchObjectives(apiToken: string): Promise<any[]> {
    try {
      return await this.makeRequest('/objectives', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch objectives: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchGroups(apiToken: string): Promise<any[]> {
    try {
      return await this.makeRequest('/groups', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch groups: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchIterations(apiToken: string): Promise<any[]> {
    try {
      return await this.makeRequest('/iterations', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch iterations: ${error.message || 'Unknown error'}`);
    }
  }

  async fetchWorkspaceInfo(apiToken: string): Promise<any> {
    try {
      return await this.makeRequest('/member', apiToken);
    } catch (error: any) {
      throw new Error(`Failed to fetch workspace info: ${error.message || 'Unknown error'}`);
    }
  }

  async createEpic(apiToken: string, epicData: any): Promise<any> {
    try {
      return await this.makeRequest('/epics', apiToken, 'POST', epicData);
    } catch (error: any) {
      throw new Error(`Failed to create epic: ${error.message || 'Unknown error'}`);
    }
  }

  async createStory(apiToken: string, storyData: any): Promise<any> {
    try {
      return await this.makeRequest('/stories', apiToken, 'POST', storyData);
    } catch (error: any) {
      throw new Error(`Failed to create story: ${error.message || 'Unknown error'}`);
    }
  }

  async createMultipleStories(apiToken: string, storiesData: any[]): Promise<any[]> {
    try {
      return await this.makeRequest('/stories/bulk', apiToken, 'POST', { stories: storiesData });
    } catch (error: any) {
      throw new Error(`Failed to create multiple stories: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Shortcut API Client
 *
 * Direct API client for Shortcut without Electron IPC.
 * Makes direct API calls from the browser with CORS support.
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const SHORTCUT_API_URL = 'https://api.app.shortcut.com/api/v3';

// Response type for API calls
export interface ShortcutApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  status?: number;
}

// Create Shortcut API client
class ShortcutApiClient {
  private apiToken: string = '';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SHORTCUT_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Set API token
  setApiToken(token: string): void {
    this.apiToken = token;
    this.axiosInstance.defaults.headers.common['Shortcut-Token'] = token;
  }

  // Get API token
  getApiToken(): string {
    return this.apiToken;
  }

  // Check if API token is set
  hasApiToken(): boolean {
    return Boolean(this.apiToken);
  }

  // Handle API requests with standardized response
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any
  ): Promise<ShortcutApiResponse> {
    try {
      let response: AxiosResponse<T>;
      
      if (method === 'get') {
        response = await this.axiosInstance.get<T>(url);
      } else if (method === 'post') {
        response = await this.axiosInstance.post<T>(url, data);
      } else if (method === 'put') {
        response = await this.axiosInstance.put<T>(url, data);
      } else if (method === 'delete') {
        response = await this.axiosInstance.delete<T>(url);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
      
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      console.error(`Shortcut API error (${method.toUpperCase()} ${url}):`, error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Unknown error',
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  }

  // Validate API token
  async validateToken(token: string): Promise<ShortcutApiResponse> {
    try {
      const tempAxios = axios.create({
        baseURL: SHORTCUT_API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Shortcut-Token': token,
        },
      });
      
      const response = await tempAxios.get('/member');
      
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to validate token',
        status: error.response?.status,
      };
    }
  }

  // Fetch projects (for backward compatibility)
  async fetchProjects(): Promise<ShortcutApiResponse> {
    return this.fetchGroups();
  }

  // Fetch groups (projects in Shortcut)
  async fetchGroups(): Promise<ShortcutApiResponse> {
    return this.request('get', '/groups');
  }

  // Fetch workflows
  async fetchWorkflows(): Promise<ShortcutApiResponse> {
    return this.request('get', '/workflows');
  }

  // Fetch workflow states
  async fetchWorkflowStates(workflowId: string): Promise<ShortcutApiResponse> {
    try {
      const response = await this.request('get', `/workflows/${workflowId}`);
      if (response.success) {
        // Extract states array from the workflow response
        const states = response.data?.states || [];
        return { success: true, data: states, status: response.status };
      }
      return response;
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch workflow states',
        status: error.response?.status,
      };
    }
  }

  // Fetch epic workflow - get workflow for an epic
  async fetchEpicWorkflow(epicId: string): Promise<ShortcutApiResponse> {
    try {
      // First get the epic
      const epicResponse = await this.request('get', `/epics/${epicId}`);
      if (!epicResponse.success) {
        return epicResponse;
      }
      
      // Then get its workflow
      const workflowId = epicResponse.data?.workflow_id;
      if (!workflowId) {
        return {
          success: false,
          message: 'Epic does not have a workflow ID',
          data: null,
        };
      }
      
      return this.request('get', `/workflows/${workflowId}`);
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch epic workflow',
        status: error.response?.status,
      };
    }
  }

  // Fetch members
  async fetchMembers(): Promise<ShortcutApiResponse> {
    return this.request('get', '/members');
  }

  // Fetch iterations
  // Optional params parameter added for web app compatibility
  async fetchIterations(params: any = {}): Promise<ShortcutApiResponse> {
    return this.request('get', '/iterations');
  }

  // Fetch labels
  async fetchLabels(): Promise<ShortcutApiResponse> {
    return this.request('get', '/labels');
  }

  // Fetch objectives
  async fetchObjectives(): Promise<ShortcutApiResponse> {
    return this.request('get', '/objectives');
  }

  // Fetch epics
  async fetchEpics(): Promise<ShortcutApiResponse> {
    return this.request('get', '/epics');
  }

  // Fetch workspace info
  async fetchWorkspaceInfo(): Promise<ShortcutApiResponse> {
    return this.request('get', '/member');
  }

  // Create epic
  async createEpic(epicData: any): Promise<ShortcutApiResponse> {
    return this.request('post', '/epics', epicData);
  }

  // Create story
  async createStory(storyData: any): Promise<ShortcutApiResponse> {
    return this.request('post', '/stories', storyData);
  }

  // Create multiple stories
  async createMultipleStories(storiesData: any[]): Promise<ShortcutApiResponse> {
    return this.request('post', '/stories/bulk', { stories: storiesData });
  }
}

// Create and export a singleton instance
const shortcutApiClient = new ShortcutApiClient();
export default shortcutApiClient;

// Export utility functions
export const validateToken = (token: string): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.validateToken(token);
};

export const setApiToken = (token: string): void => {
  shortcutApiClient.setApiToken(token);
};

export const getApiToken = (): string => {
  return shortcutApiClient.getApiToken();
};

export const hasApiToken = (): boolean => {
  return shortcutApiClient.hasApiToken();
};

// Export all API functions for direct access
export const fetchProjects = (): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchProjects();
};

export const fetchGroups = (): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchGroups();
};

export const fetchWorkflows = (): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchWorkflows();
};

export const fetchWorkflowStates = (workflowId: string): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchWorkflowStates(workflowId);
};

export const fetchEpicWorkflow = (epicId: string): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchEpicWorkflow(epicId);
};

export const fetchMembers = (): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchMembers();
};

export const fetchIterations = (params: any = {}): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchIterations(params);
};

export const fetchLabels = (): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchLabels();
};

export const fetchObjectives = (): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchObjectives();
};

export const fetchEpics = (): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchEpics();
};

export const fetchWorkspaceInfo = (): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.fetchWorkspaceInfo();
};

export const createEpic = (epicData: any): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.createEpic(epicData);
};

export const createStory = (storyData: any): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.createStory(storyData);
};

export const createMultipleStories = (storiesData: any[]): Promise<ShortcutApiResponse> => {
  return shortcutApiClient.createMultipleStories(storiesData);
};

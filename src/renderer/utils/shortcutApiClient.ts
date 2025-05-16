/**
 * Shortcut API Client
 * 
 * Web-based API client for Shortcut with enhanced functionality:
 * - Request/response interceptors for logging
 * - Comprehensive error handling
 * - Pagination support for list endpoints
 * - Standardized response format
 * - Token persistence across page refreshes
 * - In-flight request deduplication to prevent duplicate API calls
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ShortcutApiError } from '../types/shortcutApi';
import { SHORTCUT_API_URL } from '../constants/api';

// Local storage key for API token - must match key in initializeClient.ts and SettingsContext.tsx
export const API_TOKEN_STORAGE_KEY = 'shortcut_api_token';

// Global map to track in-flight token validation requests to avoid duplicate API calls
const inflightValidationMap = new Map<string, Promise<ShortcutApiResponse>>();

// Helper functions for token persistence
const saveTokenToStorage = (token: string): void => {
  try {
    localStorage.setItem(API_TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.warn('Failed to save API token to localStorage:', error);
  }
};

const getTokenFromStorage = (): string => {
  try {
    return localStorage.getItem(API_TOKEN_STORAGE_KEY) || '';
  } catch (error) {
    console.warn('Failed to get API token from localStorage:', error);
    return '';
  }
};

// Response type for API calls
export interface ShortcutApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  status?: number;
}

/**
 * Creates and configures an Axios client for Shortcut API
 */
export const createShortcutClient = (apiToken: string): AxiosInstance => {
  // Create a new Axios instance with default configuration
  const client = axios.create({
    baseURL: SHORTCUT_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Shortcut-Token': apiToken
    }
  });

  // Add request interceptor for logging API requests
  client.interceptors.request.use(
    (config) => {
      console.log(`🚀 Shortcut API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.log('⚠️ Shortcut API Request Error:', error.message);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  // Define the shape of the expected error response from Shortcut API
  interface ShortcutErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
  }

  client.interceptors.response.use(
    (response) => {
      console.log(`✅ Shortcut API Response: ${response.status} ${response.statusText}`, 
        response.config.url);
      return response;
    },
    (error: AxiosError<ShortcutErrorResponse>) => {
      const apiError: ShortcutApiError = {
        message: 'An unknown error occurred'
      };

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        apiError.message = error.response.data?.message || 
          `API Error: ${error.response.status} ${error.response.statusText}`;
        apiError.code = error.response.status.toString();
        if (error.response.data?.errors) {
          apiError.errors = error.response.data.errors;
        }
      } else if (error.request) {
        // The request was made but no response was received
        apiError.message = 'No response received from Shortcut API';
      } else {
        // Something happened in setting up the request that triggered an Error
        apiError.message = error.message;
      }

      console.log('❌ Shortcut API Error:', apiError.message);
      return Promise.reject(apiError);
    }
  );

  return client;
};

/**
 * Handles API pagination for endpoints that return lists of items
 * @param client Axios client
 * @param url API endpoint
 * @param config Optional axios config
 * @returns Promise resolving to all items from all pages
 */
export const getPaginatedResults = async <T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<T[]> => {
  let allResults: T[] = [];
  let nextToken: string | undefined;
  
  do {
    const requestConfig = { 
      ...config,
      params: {
        ...config?.params,
        ...(nextToken ? { after_id: nextToken } : {})
      }
    };
    
    const response = await client.get<T[]>(url, requestConfig);
    console.log(`📋 Shortcut API Pagination: Retrieved ${response.data.length} items from ${url}`);
    
    // Add this page of results to our collection
    allResults = [...allResults, ...response.data];
    
    // Get the next token from Link header if it exists
    const linkHeader = response.headers.link || response.headers.Link;
    nextToken = undefined;
    
    if (linkHeader) {
      const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (match) {
        const nextUrl = new URL(match[1]);
        nextToken = nextUrl.searchParams.get('after_id') || undefined;
      }
    }
  } while (nextToken);
  
  return allResults;
};

/**
 * Shortcut API Client Class
 * 
 * Enhanced implementation combining the best of both previous versions.
 * Provides a comprehensive set of methods for interacting with the Shortcut API.
 */
class ShortcutApiClient {
  private apiToken: string = '';
  private axiosInstance: AxiosInstance;

  constructor() {
    // Initialize with token from localStorage if available
    this.apiToken = getTokenFromStorage();
    
    // Create a client with the token if available, otherwise use a placeholder
    if (this.apiToken) {
      this.axiosInstance = createShortcutClient(this.apiToken);
    } else {
      this.axiosInstance = axios.create({
        baseURL: SHORTCUT_API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  // Set API token and persist it
  setApiToken(token: string): void {
    if (!token) {
      // Only proceed with empty token if explicitly intending to clear it
      if (this.apiToken && !window.confirm('Are you sure you want to clear the API token?')) {
        return;
      }
    }
    
    // Only update if token has changed
    if (this.apiToken !== token) {
      this.apiToken = token;
      
      // Save to localStorage for persistence across page refreshes
      saveTokenToStorage(token);
      
      // Create a new client with the token and interceptors
      this.axiosInstance = createShortcutClient(token);
    }
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
        message: error.message || 'Unknown error',
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  }

  // Get all pages for a list endpoint
  private async getPaginatedRequest<T>(url: string): Promise<ShortcutApiResponse> {
    try {
      const results = await getPaginatedResults<T>(this.axiosInstance, url);
      return {
        success: true,
        data: results,
        status: 200,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get paginated results',
        status: error.response?.status,
      };
    }
  }

  // Validate API token with in-flight request deduplication
  async validateToken(token: string): Promise<ShortcutApiResponse> {
    if (!token) {
      return {
        success: false,
        message: 'Token is required',
        status: 400,
      };
    }
    
    // Generate a unique key using the first 8 chars of the token
    const tokenKey = `validate-token-${token.substring(0, 8)}`;
    
    // Check if there's already an in-flight request for this token
    if (inflightValidationMap.has(tokenKey)) {
      console.log('Joining existing in-flight token validation request');
      return inflightValidationMap.get(tokenKey)!;
    }
    
    // Create a new promise for the validation request
    const validationPromise = (async () => {
      try {
        // Create a temporary client just for validation
        const tempClient = createShortcutClient(token);
        const response = await tempClient.get('/member');
        
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
      } finally {
        // Always clean up the in-flight request when done, regardless of success/failure
        inflightValidationMap.delete(tokenKey);
      }
    })();
    
    // Store the promise in the map for reuse
    inflightValidationMap.set(tokenKey, validationPromise);
    
    // Return the promise
    return validationPromise;
  }

  // Fetch projects (for backward compatibility)
  async fetchProjects(): Promise<ShortcutApiResponse> {
    return this.fetchGroups();
  }

  // Fetch groups (projects in Shortcut)
  async fetchGroups(): Promise<ShortcutApiResponse> {
    return this.getPaginatedRequest<any>('/groups');
  }

  // Fetch workflows
  async fetchWorkflows(): Promise<ShortcutApiResponse> {
    return this.getPaginatedRequest<any>('/workflows');
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
    return this.getPaginatedRequest<any>('/members');
  }

  // Fetch iterations
  async fetchIterations(params: any = {}): Promise<ShortcutApiResponse> {
    return this.getPaginatedRequest<any>('/iterations');
  }

  // Fetch labels
  async fetchLabels(): Promise<ShortcutApiResponse> {
    return this.getPaginatedRequest<any>('/labels');
  }

  // Fetch objectives
  async fetchObjectives(): Promise<ShortcutApiResponse> {
    return this.getPaginatedRequest<any>('/objectives');
  }

  // Fetch epics
  async fetchEpics(): Promise<ShortcutApiResponse> {
    return this.getPaginatedRequest<any>('/epics');
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

// Export utility functions for direct access
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

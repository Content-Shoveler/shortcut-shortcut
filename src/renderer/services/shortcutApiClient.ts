import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Base URL for the Shortcut API
const SHORTCUT_API_URL = 'https://api.app.shortcut.com/api/v3';

// Interface for API responses
export interface ShortcutApiResponse {
  success: boolean;
  status?: number;
  message?: string;
  data?: any;
}

// Create a direct Shortcut API client
export function createShortcutClient(apiToken: string): AxiosInstance {
  return axios.create({
    baseURL: SHORTCUT_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Shortcut-Token': apiToken
    }
  });
}

// Helper function to handle API errors consistently
export function handleApiError(error: AxiosError): ShortcutApiResponse {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      success: false,
      status: error.response.status,
      message: error.response.data && 
               typeof error.response.data === 'object' && 
               'message' in error.response.data && 
               typeof error.response.data.message === 'string'
        ? error.response.data.message 
        : `API Error: ${error.response.status}`,
      data: error.response.data
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'No response received from Shortcut API',
    };
  } else {
    // Something happened in setting up the request
    return {
      success: false,
      message: error.message || 'Unknown error occurred',
    };
  }
}

// API function to validate token
export async function validateToken(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/member');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch members
export async function fetchMembers(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/members');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch labels
export async function fetchLabels(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    // Using slim=true to get only essential label data
    const response = await client.get('/labels?slim=true');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch objectives
export async function fetchObjectives(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/objectives');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch groups/teams
export async function fetchGroups(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/groups');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch iterations
export async function fetchIterations(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/iterations');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch workspace info (for estimate scale)
export async function fetchWorkspaceInfo(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/member');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch projects
export async function fetchProjects(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/projects');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch workflows
export async function fetchWorkflows(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/workflows');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch workflow states
export async function fetchWorkflowStates(
  apiToken: string, 
  workflowId: string
): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    // Get the workflow data which includes states
    const response = await client.get(`/workflows/${workflowId}`);
    
    // Extract states from the workflow response
    if (response.data && Array.isArray(response.data.states)) {
      return { success: true, data: response.data.states };
    } else {
      return { success: true, data: [] }; // Return empty array if no states
    }
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to fetch epic workflow
export async function fetchEpicWorkflow(apiToken: string): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.get('/epic-workflow');
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to create an epic
export async function createEpic(apiToken: string, epicData: any): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.post('/epics', epicData);
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to create a story
export async function createStory(apiToken: string, storyData: any): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.post('/stories', storyData);
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// API function to create multiple stories at once
export async function createMultipleStories(
  apiToken: string, 
  storiesData: any[]
): Promise<ShortcutApiResponse> {
  if (!apiToken) {
    return { success: false, message: 'API token is required' };
  }
  
  try {
    const client = createShortcutClient(apiToken);
    const response = await client.post('/stories/bulk', { stories: storiesData });
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
}

// Export all API functions in a single object for easier usage
export const shortcutApi = {
  validateToken,
  fetchMembers,
  fetchLabels,
  fetchObjectives,
  fetchGroups,
  fetchIterations,
  fetchWorkspaceInfo,
  fetchProjects,
  fetchWorkflows,
  fetchWorkflowStates,
  fetchEpicWorkflow,
  createEpic,
  createStory,
  createMultipleStories
};

export default shortcutApi;

/**
 * Shortcut API Utilities
 *
 * This file contains utilities for interacting with the Shortcut API
 * using the Electron IPC bridge. All requests are handled in the main
 * process to avoid CORS issues.
 */
import { 
  ShortcutProject, 
  ShortcutWorkflow, 
  ShortcutWorkflowState,
} from '../types/shortcutApi';
import { ShortcutApiResponse } from '../types/electron';

// Helper type for the Electron API with shortcutApi
type APIWithShortcut = typeof window.electronAPI & {
  shortcutApi: {
    validateToken: (token: string) => Promise<ShortcutApiResponse>;
    fetchProjects: (token: string) => Promise<ShortcutApiResponse>;
    fetchWorkflows: (token: string) => Promise<ShortcutApiResponse>;
    fetchWorkflowStates: (token: string, workflowId: string) => Promise<ShortcutApiResponse>;
    createEpic: (token: string, epicData: any) => Promise<ShortcutApiResponse>;
    createStory: (token: string, storyData: any) => Promise<ShortcutApiResponse>;
  }
};

/**
 * Fetches all projects from Shortcut
 */
export async function fetchProjects(apiToken: string): Promise<ShortcutProject[]> {
  if (!apiToken) {
    throw new Error('API token is required');
  }

  try {
    const api = window.electronAPI as APIWithShortcut;
    const response = await api.shortcutApi.fetchProjects(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch projects');
    }
    
    return response.data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches all workflows from Shortcut
 */
export async function fetchWorkflows(apiToken: string): Promise<ShortcutWorkflow[]> {
  if (!apiToken) {
    throw new Error('API token is required');
  }

  try {
    const api = window.electronAPI as APIWithShortcut;
    const response = await api.shortcutApi.fetchWorkflows(apiToken);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workflows');
    }
    
    return response.data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches workflow states for a specific workflow
 */
export async function fetchWorkflowStates(
  apiToken: string, 
  workflowId: string | number
): Promise<ShortcutWorkflowState[]> {
  if (!apiToken) {
    throw new Error('API token is required');
  }

  try {
    const api = window.electronAPI as APIWithShortcut;
    const response = await api.shortcutApi.fetchWorkflowStates(
      apiToken, 
      workflowId.toString()
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workflow states');
    }
    
    return response.data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Creates an epic with associated stories in Shortcut
 */
export async function createEpicWithStories(
  apiToken: string,
  epicData: {
    name: string;
    description: string;
    state: string;
    projectId: string;
    workflowId: string;
  },
  stories: Array<{
    name: string;
    description: string;
    type: string;
    state: string;
    estimate?: number;
    labels?: string[];
  }>
): Promise<{ epicId: string; storyIds: string[] }> {
  if (!apiToken) {
    throw new Error('API token is required');
  }
  
  try {
    const api = window.electronAPI as APIWithShortcut;
    
    // 1. Create the epic
    const epicPayload = {
      name: epicData.name,
      description: epicData.description,
      // Convert project ID to an array of project IDs
      project_ids: [epicData.projectId],
      // Add labels if needed
      labels: []
    };

    const epicResponse = await api.shortcutApi.createEpic(apiToken, epicPayload);
    if (!epicResponse.success) {
      throw new Error(epicResponse.message || 'Failed to create epic');
    }
    
    const epic = epicResponse.data;
    
    // 2. Get workflow states to map state names to IDs
    const workflowStates = await fetchWorkflowStates(apiToken, epicData.workflowId);
    
    // 3. Create each story linked to the epic
    const storyIds: string[] = [];
    
    for (const storyData of stories) {
      // Find workflow state ID that matches the state name
      const state = workflowStates.find(s => s.name === storyData.state);
      if (!state) {
        console.warn(`State "${storyData.state}" not found in workflow. Using first available state.`);
      }
      
      const workflowStateId = state?.id || workflowStates[0].id;
      
      const storyPayload = {
        name: storyData.name,
        description: storyData.description,
        story_type: storyData.type as 'feature' | 'bug' | 'chore',
        workflow_state_id: workflowStateId,
        epic_id: epic.id,
        project_id: epicData.projectId,
        estimate: storyData.estimate,
        labels: storyData.labels?.map(label => ({ name: label }))
      };
      
      const storyResponse = await api.shortcutApi.createStory(apiToken, storyPayload);
      if (!storyResponse.success) {
        throw new Error(storyResponse.message || 'Failed to create story');
      }
      
      storyIds.push(storyResponse.data.id.toString());
    }
    
    return {
      epicId: epic.id.toString(),
      storyIds
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Validates an API token by attempting to fetch current member info
 */
export async function validateApiToken(apiToken: string): Promise<boolean> {
  if (!apiToken) {
    return false;
  }
  
  try {
    const api = window.electronAPI as APIWithShortcut;
    const response = await api.shortcutApi.validateToken(apiToken);
    return response.success;
  } catch (error) {
    return false;
  }
}

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

  if (!workflowId) {
    console.warn('No workflow ID provided for fetchWorkflowStates');
    return [];
  }

  try {
    console.log(`Fetching workflow states for workflow ID: ${workflowId}`);
    const api = window.electronAPI as APIWithShortcut;
    const response = await api.shortcutApi.fetchWorkflowStates(
      apiToken, 
      workflowId.toString()
    );
    
    if (!response.success) {
      console.error('Failed to fetch workflow states:', response.message, response);
      throw new Error(response.message || 'Failed to fetch workflow states');
    }
    
    const states = response.data || [];
    console.log(`Retrieved ${states.length} workflow states`);
    return states;
  } catch (error) {
    console.error('Error in fetchWorkflowStates:', error);
    // Return empty array instead of throwing to prevent infinite retries
    return [];
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
    workflow_id?: string;
    workflow_state_id?: string;
    estimate?: number;
    labels?: string[];
  }>
): Promise<{ epicId: string; storyIds: string[] }> {
  if (!apiToken) {
    throw new Error('API token is required');
  }
  
  try {
    const api = window.electronAPI as APIWithShortcut;
    
    // 1. Create the epic with only the required name parameter
    const epicPayload = {
      name: epicData.name
      // Description and all other fields removed to ensure minimal payload
    };

    console.log('Sending epic payload:', JSON.stringify(epicPayload));
    const epicResponse = await api.shortcutApi.createEpic(apiToken, epicPayload);
    
    if (!epicResponse.success) {
      // Log detailed error information for debugging
      console.error('Epic creation failed:', epicResponse);
      throw new Error(
        `Failed to create epic: ${epicResponse.message || 'Unknown error'}\n` +
        `Status: ${epicResponse.status || 'N/A'}\n` +
        `Response data: ${JSON.stringify(epicResponse.data || {})}`
      );
    }
    
    const epic = epicResponse.data;
    
    // 3. Create each story linked to the epic
    const storyIds: string[] = [];
    
    for (const storyData of stories) {
      // Create story with only the required parameters
      const storyPayload: Record<string, any> = {
        name: storyData.name,
        story_type: storyData.type as 'feature' | 'bug' | 'chore',
        epic_id: epic.id
      };
      
      // Use workflow_state_id from template if available
      if (storyData.workflow_state_id) {
        storyPayload.workflow_state_id = storyData.workflow_state_id;
      } else {
        // Fallback to finding a state by name for backward compatibility
        try {
          const workflowStates = await fetchWorkflowStates(apiToken, epicData.workflowId);
          const state = workflowStates.find(s => s.name === storyData.state);
          if (state) {
            storyPayload.workflow_state_id = state.id;
          } else if (workflowStates.length > 0) {
            console.warn(`State "${storyData.state}" not found in workflow. Using first available state.`);
            storyPayload.workflow_state_id = workflowStates[0].id;
          } else {
            // This will likely cause a 400 error but we don't have a better option
            console.warn('No workflow states available and no workflow_state_id provided!');
          }
        } catch (error) {
          console.error('Error finding workflow state:', error);
          // Continue without workflow_state_id and let the API handle the error
        }
      }
      
      // Only add optional fields if they have values
      if (storyData.description) {
        storyPayload.description = storyData.description;
      }
      
      if (epicData.projectId) {
        storyPayload.project_id = epicData.projectId;
      }
      
      if (storyData.estimate) {
        storyPayload.estimate = storyData.estimate;
      }
      
      if (storyData.labels && storyData.labels.length > 0) {
        storyPayload.labels = storyData.labels.map(label => ({ name: label }));
      }
      
      console.log('Sending story payload:', JSON.stringify(storyPayload));
      
      const storyResponse = await api.shortcutApi.createStory(apiToken, storyPayload);
      
      if (!storyResponse.success) {
        // Log detailed error information for debugging
        console.error('Story creation failed:', storyResponse);
        throw new Error(
          `Failed to create story: ${storyResponse.message || 'Unknown error'}\n` +
          `Status: ${storyResponse.status || 'N/A'}\n` +
          `Response data: ${JSON.stringify(storyResponse.data || {})}`
        );
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

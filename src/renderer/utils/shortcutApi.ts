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
    
    // Ensure we're getting the 'states' array from the workflow response
    const states = response.data || [];
    console.log(`Retrieved ${states.length} workflow states:`, states);
    
    if (states.length === 0) {
      console.warn(`No states found for workflow ID: ${workflowId}`);
    }
    
    return states;
  } catch (error) {
    console.error('Error in fetchWorkflowStates:', error);
    // Return empty array instead of throwing to prevent infinite retries
    return [];
  }
}

/**
 * Creates an epic with associated stories in Shortcut
 * 
 * Uses workflow_state_id from template stories when available,
 * falling back to finding state by name only if necessary
 */
/**
 * Type definition for epic data passed to createEpicWithStories
 */
export interface CreateEpicParams {
  name: string;
  description: string;
  state: string;
  epic_state_id?: number;
  workflowId?: string;
}

export async function createEpicWithStories(
  apiToken: string,
  epicData: CreateEpicParams & Record<string, any>, // Allow additional fields from the API
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
    
    // 1. Create the epic with all fields from epicData
    // with proper format transformations for Shortcut API
    const epicPayload: Record<string, any> = {
      ...epicData,
      // If epic_state_id is provided, use it
      ...(epicData.epic_state_id && { epic_state_id: epicData.epic_state_id }),
    };
    
    // Format owner_ids to ensure it's an array of UUIDs
    if (epicData.owner_ids) {
      // Ensure it's an array even if a single value is provided
      const ownerIds = Array.isArray(epicData.owner_ids) ? epicData.owner_ids : [epicData.owner_ids];
      epicPayload.owner_ids = ownerIds.map(id => id.toString());
    }
    
    // Remove state if epic_state_id is provided to avoid conflicts
    if (epicPayload.epic_state_id && epicPayload.state) {
      delete epicPayload.state;
    }
    
    // Format objective_ids to ensure it's an array of integers
    if (epicData.objective_ids && Array.isArray(epicData.objective_ids)) {
      epicPayload.objective_ids = epicData.objective_ids.map(id => {
        // Convert to number if it's a string but contains only digits
        if (typeof id === 'string' && /^\d+$/.test(id)) {
          return parseInt(id, 10);
        }
        return id;
      });
    }
    
    // Format group_ids to ensure it's an array of strings
    if (epicData.group_ids && Array.isArray(epicData.group_ids)) {
      epicPayload.group_ids = epicData.group_ids.map(id => id.toString());
    }

    // Remove any properties that shouldn't be sent to the API
    delete epicPayload.workflowId;

    console.log('Sending epic payload:', JSON.stringify(epicPayload, null, 2));
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
      // Create story with all fields from storyData
      // and necessary transformations for the Shortcut API
      const storyPayload: Record<string, any> = {
        // Start with all fields from storyData
        ...storyData,
        // Add epic_id
        epic_id: epic.id,
        // Map type to story_type (required by Shortcut API)
        story_type: storyData.type as 'feature' | 'bug' | 'chore',
      };
      
      // Delete internal fields that don't map directly to API
      delete storyPayload.type; // Replaced with story_type
      delete storyPayload.state; // Will be handled by workflow_state_id
      
      // Remove labels functionality entirely
      
      // Handle workflow state ID resolution if not explicitly provided
      if (!storyPayload.workflow_state_id) {
        let workflowStates: ShortcutWorkflowState[] = [];
        
        // Try to get workflow states from story's workflow_id first
        if (storyPayload.workflow_id) {
          workflowStates = await fetchWorkflowStates(apiToken, storyPayload.workflow_id);
        } 
        // Fall back to epicData.workflowId if needed
        else if (epicData.workflowId) {
          workflowStates = await fetchWorkflowStates(apiToken, epicData.workflowId);
        }
        
        if (workflowStates.length > 0) {
          // Try to find state by name
          const state = workflowStates.find(s => s.name === storyData.state);
          if (state) {
            storyPayload.workflow_state_id = state.id;
          } else {
            console.warn(`State "${storyData.state}" not found in workflow. Using first available state.`);
            storyPayload.workflow_state_id = workflowStates[0].id;
          }
        } else {
          console.error('No workflow states found - story creation may fail');
        }
      }
      
      // Remove workflow_id after we've used it to find the workflow_state_id
      // as the API doesn't accept both
      delete storyPayload.workflow_id;
      
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

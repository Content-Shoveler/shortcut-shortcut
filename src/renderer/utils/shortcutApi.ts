/**
 * Shortcut API Utilities
 *
 * This file contains utilities for interacting with the Shortcut API
 * using the clubhouse-lib library.
 */

// Using require instead of import for clubhouse-lib since it might not have proper TypeScript definitions
const ClubhouseLib = require('clubhouse-lib');

/**
 * Create a Shortcut API client with the given token
 * @param apiToken Shortcut API token
 * @returns Clubhouse client
 */
function createClient(apiToken: string): any {
  return ClubhouseLib.create(apiToken);
}

/**
 * Fetch all projects from Shortcut
 * @param apiToken Shortcut API token
 * @returns Array of projects
 */
export async function fetchProjects(apiToken: string): Promise<any[]> {
  try {
    const client = createClient(apiToken);
    return await client.listProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects from Shortcut');
  }
}

/**
 * Fetch all workflows from Shortcut
 * @param apiToken Shortcut API token
 * @returns Array of workflows
 */
export async function fetchWorkflows(apiToken: string): Promise<any[]> {
  try {
    const client = createClient(apiToken);
    return await client.listWorkflows();
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw new Error('Failed to fetch workflows from Shortcut');
  }
}

/**
 * Create an epic with stories in Shortcut
 * @param apiToken Shortcut API token
 * @param epicData Epic data
 * @param stories Array of story data
 * @returns Object containing the created epic ID and story IDs
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
  try {
    const client = createClient(apiToken);
    
    // Create the epic
    const epic = await client.createEpic({
      name: epicData.name,
      description: epicData.description,
      state: epicData.state,
      project_id: parseInt(epicData.projectId, 10)
    });
    
    // Create each story linked to the epic
    const storyPromises = stories.map(story => {
      const storyParams: any = {
        name: story.name,
        description: story.description,
        story_type: story.type,
        workflow_state_id: parseInt(story.state, 10),
        epic_id: epic.id
      };
      
      if (story.estimate) {
        storyParams.estimate = story.estimate;
      }
      
      if (story.labels && story.labels.length > 0) {
        storyParams.labels = story.labels.map(label => ({ name: label }));
      }
      
      return client.createStory(storyParams);
    });
    
    const createdStories = await Promise.all(storyPromises);
    
    return {
      epicId: epic.id.toString(),
      storyIds: createdStories.map((s: any) => s.id.toString())
    };
  } catch (error) {
    console.error('Error creating epic with stories:', error);
    throw new Error('Failed to create epic with stories in Shortcut');
  }
}

/**
 * Validate an API token by making a simple API call
 * @param apiToken Shortcut API token to validate
 * @returns True if the token is valid
 */
export async function validateApiToken(apiToken: string): Promise<boolean> {
  if (!apiToken) return false;
  
  try {
    const client = createClient(apiToken);
    // Make a simple API call that should work with any valid token
    // Fetch just one member to minimize data transfer
    await client.listMembers({ page_size: 1 });
    return true;
  } catch (error) {
    console.error('Error validating API token:', error);
    return false;
  }
}

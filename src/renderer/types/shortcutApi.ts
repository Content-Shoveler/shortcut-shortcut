/**
 * Type definitions for Shortcut API
 */

export interface ShortcutProject {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ShortcutWorkflow {
  id: number;
  name: string;
  states: ShortcutWorkflowState[];
  created_at: string;
  updated_at: string;
}

export interface ShortcutWorkflowState {
  id: number;
  name: string;
  type: string;
  position: number;
}

export interface ShortcutEpic {
  id: number;
  name: string;
  description: string;
  state: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface ShortcutStory {
  id: number;
  name: string;
  description: string;
  story_type: string;
  workflow_state_id: number;
  estimate?: number;
  labels?: Array<{name: string}>;
  epic_id?: number;
  created_at: string;
  updated_at: string;
}

// API request params
export interface EpicCreateParams {
  name: string;
  description?: string;
  state: string;
  project_id: number;
}

export interface StoryCreateParams {
  name: string;
  description?: string;
  story_type: string;
  workflow_state_id: number;
  estimate?: number;
  labels?: Array<{name: string}>;
  epic_id?: number;
}

// API response types
export interface CreateEpicResponse {
  id: number;
  name: string;
  description: string;
  state: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateStoryResponse {
  id: number;
  name: string;
  description: string;
  story_type: string;
  workflow_state_id: number;
  epic_id?: number;
  created_at: string;
  updated_at: string;
}

// Create epic with stories response
export interface CreateEpicWithStoriesResult {
  epicId: number;
  storyIds: number[];
}

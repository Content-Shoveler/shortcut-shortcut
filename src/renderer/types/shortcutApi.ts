/**
 * Type definitions for Shortcut API entities
 */

// Base entity interface with common properties
export interface ShortcutEntity {
  id: number | string;
  created_at: string;
  updated_at: string;
}

// Member (user) interface
export interface ShortcutMember extends ShortcutEntity {
  profile: {
    email_address: string;
    name: string;
    mention_name: string;
    display_icon?: string;
  };
  disabled: boolean;
}

// Project interface
export interface ShortcutProject extends ShortcutEntity {
  name: string;
  description: string;
  abbreviation: string;
  color: string;
  archived: boolean;
  follower_ids: string[] | number[];
  team_id: number | string;
}

// Epic interface
export interface ShortcutEpic extends ShortcutEntity {
  name: string;
  description: string;
  state: string;
  owner_ids: string[] | number[];
  follower_ids: string[] | number[];
  project_ids: string[] | number[];
  requested_by_id: string | number;
  deadline?: string;
  planned_start_date?: string;
  started?: boolean;
  started_at?: string;
  completed?: boolean;
  completed_at?: string;
}

// Story interface
export interface ShortcutStory extends ShortcutEntity {
  name: string;
  description: string;
  story_type: string;
  workflow_state_id: number | string;
  epic_id?: number | string;
  iteration_id?: number | string;
  project_id: number | string;
  requested_by_id: number | string;
  owner_ids: Array<number | string>;
  follower_ids: Array<number | string>;
  estimate?: number;
  deadline?: string;
  started?: boolean;
  started_at?: string;
  completed?: boolean;
  completed_at?: string;
  labels?: ShortcutLabel[];
}

// Label interface
export interface ShortcutLabel extends ShortcutEntity {
  name: string;
  color: string;
  description?: string;
  archived: boolean;
}

// Workflow interface
export interface ShortcutWorkflow extends ShortcutEntity {
  name: string;
  description?: string;
  states: ShortcutWorkflowState[];
  default: boolean;
  auto_assign_owner: boolean;
  team_id?: number | string;
}

// Workflow state interface
export interface ShortcutWorkflowState extends ShortcutEntity {
  name: string;
  type: 'unstarted' | 'started' | 'done';
  position: number;
  description?: string;
  color: string;
  num_stories: number;
}

// API response interfaces
export interface ShortcutListResponse<T> {
  data: T[];
  next?: string;  // For pagination
}

// API error interface
export interface ShortcutApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Request payloads

// Epic creation payload
export interface CreateEpicPayload {
  name: string;
  description?: string;
  owner_ids?: Array<number | string>;
  state?: string;
  milestone_id?: number | string;
  deadline?: string;
  labels?: Array<{ name: string; color?: string }>;
  planned_start_date?: string;
  project_ids?: Array<number | string>;
}

// Story creation payload
export interface CreateStoryPayload {
  name: string;
  description?: string;
  story_type: 'feature' | 'bug' | 'chore';
  workflow_state_id: number | string;
  epic_id?: number | string;
  project_id: number | string;
  owner_ids?: Array<number | string>;
  labels?: Array<{ name: string; color?: string }>;
  deadline?: string;
  estimate?: number;
}

export interface ShortcutEntity {
  id: number | string;
  created_at: string;
  updated_at: string;
}

export interface ShortcutMember extends ShortcutEntity {
  profile: {
    email_address: string;
    name: string;
    mention_name: string;
    display_icon?: string;
  };
  disabled: boolean;
}

export interface ShortcutProject extends ShortcutEntity {
  name: string;
  description: string;
  abbreviation: string;
  color: string;
  archived: boolean;
  follower_ids: (number | string)[];
  team_id: number | string;
}

export interface ShortcutEpic extends ShortcutEntity {
  name: string;
  description: string;
  state: string;
  owner_ids: (number | string)[];
  follower_ids: (number | string)[];
  project_ids: (number | string)[];
  requested_by_id: number | string;
  deadline?: string;
  planned_start_date?: string;
  started?: boolean;
  started_at?: string;
  completed?: boolean;
  completed_at?: string;
}

export interface ShortcutStory extends ShortcutEntity {
  name: string;
  description: string;
  story_type: string;
  workflow_state_id: number | string;
  epic_id?: number | string;
  iteration_id?: number | string;
  project_id: number | string;
  requested_by_id: number | string;
  owner_ids: (number | string)[];
  follower_ids: (number | string)[];
  estimate?: number;
  deadline?: string;
  started?: boolean;
  started_at?: string;
  completed?: boolean;
  completed_at?: string;
  labels?: ShortcutLabel[];
}

export interface ShortcutLabel extends ShortcutEntity {
  name: string;
  color: string;
  description?: string;
  archived: boolean;
}

export interface ShortcutWorkflow extends ShortcutEntity {
  name: string;
  description?: string;
  states: ShortcutWorkflowState[];
  default: boolean;
  auto_assign_owner: boolean;
  team_id?: number | string;
}

export interface ShortcutWorkflowState extends ShortcutEntity {
  name: string;
  type: 'unstarted' | 'started' | 'done';
  position: number;
  description?: string;
  color: string;
  num_stories: number;
}

export interface ShortcutListResponse<T> {
  data: T[];
  next?: string;
}

export interface ShortcutApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface CreateEpicPayload {
  name: string;
}

export interface CreateStoryPayload {
  name: string;
  description?: string;
  story_type: 'feature' | 'bug' | 'chore';
  workflow_state_id: number | string;
  epic_id?: number | string;
  owner_ids?: (number | string)[];
  labels?: { name: string; color?: string }[];
  deadline?: string;
  estimate?: number;
}

# Create Multiple Stories

Create Multiple Stories allows you to create multiple stories in a single request using the same syntax as Create Story.

## API Endpoint

```
POST https://api.app.shortcut.com/api/v3/stories/bulk
```

## Example Request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -d '{ "stories": [{ 
    "name": "New Story", 
    "description": "Story description", 
    "workflow_state_id": 123,
    "story_type": "feature" 
  },{ 
    "name": "Another Story", 
    "description": "Another story description", 
    "workflow_state_id": 123,
    "story_type": "bug" 
  }] }' \
  -L "https://api.app.shortcut.com/api/v3/stories/bulk"
```

## Request Parameters

| Name | Type | Description |
|------|------|-------------|
| `stories` | Array [CreateStoryParams] | **Required.** An array of stories to be created. |

## CreateStoryParams Structure

Each story in the `stories` array follows the same structure as the Create Story endpoint. Here are the key parameters:

| Name | Type | Description |
|------|------|-------------|
| `name` | String (512) | Required. The name of the story. |
| `workflow_state_id` | Integer | The ID of the workflow state the story will be in. Either this or `project_id` must be provided. |
| `project_id` | Integer or null | The ID of the project the story belongs to. Either this or `workflow_state_id` must be provided. |
| `description` | String (100000) | The description of the story. |
| `story_type` | Enum (bug, chore, feature) | The type of story. |
| `epic_id` | Integer or null | The ID of the epic the story belongs to. |
| `estimate` | Integer or null | The numeric point estimate of the story. |
| `owner_ids` | Array [UUID] | An array of UUIDs for the owners of the story. |
| `labels` | Array [CreateLabelParams] | An array of labels attached to the story. |
| `files` | Array [Integer] | An array of files attached to the story. |
| `iteration_id` | Integer or null | The ID of the iteration the story belongs to. |
| `tasks` | Array [CreateTaskParams] | An array of tasks connected to the story. |
| `custom_fields` | Array [CustomFieldValueParams] | Custom field values for the story. |

> Note: For a complete list of parameters, refer to the Create Story documentation.

## Response Example

```json
[
  {
    "app_url": "https://app.shortcut.com/organization/story/123",
    "archived": false,
    "blocked": false,
    "blocker": false,
    "comment_ids": [],
    "completed": false,
    "created_at": "2023-04-19T14:30:00Z",
    "description": "Story description",
    "entity_type": "story",
    "epic_id": null,
    "estimate": null,
    "external_id": null,
    "external_links": [],
    "file_ids": [],
    "follower_ids": [],
    "group_id": null,
    "id": 123,
    "iteration_id": null,
    "label_ids": [],
    "labels": [],
    "name": "New Story",
    "owner_ids": [],
    "position": 123,
    "project_id": null,
    "requested_by_id": "12345678-9012-3456-7890-123456789012",
    "started": false,
    "story_type": "feature",
    "task_ids": [],
    "updated_at": "2023-04-19T14:30:00Z",
    "workflow_state_id": 123
  },
  {
    "app_url": "https://app.shortcut.com/organization/story/124",
    "archived": false,
    "blocked": false,
    "blocker": false,
    "comment_ids": [],
    "completed": false,
    "created_at": "2023-04-19T14:30:00Z",
    "description": "Another story description",
    "entity_type": "story",
    "epic_id": null,
    "estimate": null,
    "external_id": null,
    "external_links": [],
    "file_ids": [],
    "follower_ids": [],
    "group_id": null,
    "id": 124,
    "iteration_id": null,
    "label_ids": [],
    "labels": [],
    "name": "Another Story",
    "owner_ids": [],
    "position": 124,
    "project_id": null,
    "requested_by_id": "12345678-9012-3456-7890-123456789012",
    "started": false,
    "story_type": "bug",
    "task_ids": [],
    "updated_at": "2023-04-19T14:30:00Z",
    "workflow_state_id": 123
  }
]
```

## Response Status Codes

| Code | Description |
|------|-------------|
| 201  | Array of StorySlim objects |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Notes for React Implementation

When implementing this API in a React application:

1. The Create Multiple Stories endpoint is efficient for batch creating stories, such as when importing from another system or creating sprint tasks.
2. Each story in the array must include either `workflow_state_id` or `project_id`, but not both.
3. The response returns an array of created stories in the same order as the request.
4. Error handling should account for scenarios where some stories succeed while others fail.
5. Consider implementing a progress indicator for large batches as the API may take longer to respond compared to creating a single story.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface CreateStoryParams {
  name: string;                    // Required
  description?: string;
  workflow_state_id?: number;      // Either this or project_id is required
  project_id?: number;             // Either this or workflow_state_id is required
  story_type?: 'bug' | 'chore' | 'feature';
  estimate?: number | null;
  epic_id?: number | null;
  iteration_id?: number | null;
  owner_ids?: string[];            // Array of UUIDs
  labels?: CreateLabelParams[];
  tasks?: CreateTaskParams[];
  custom_fields?: CustomFieldValueParams[];
  // Additional fields as needed
}

interface CreateMultipleStoriesRequest {
  stories: CreateStoryParams[];    // Required
}

interface StorySlim {
  id: number;
  name: string;
  description: string;
  story_type: string;
  workflow_state_id: number;
  // Other fields as needed
}
```

# Stories - Create Story

Create Story is used to add a new story to your Shortcut Workspace.

> **Important Note**: This endpoint requires that either `workflow_state_id` or `project_id` be provided, but will reject the request if both or neither are specified. The `workflow_state_id` has been marked as required and is the recommended field to specify because Shortcut is in the process of sunsetting Projects.

## API Endpoint

```
POST https://api.app.shortcut.com/api/v3/stories
```

## Example Request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -d '{ 
    "name": "New Story",
    "description": "Story description", 
    "story_type": "feature", 
    "workflow_state_id": 123
  }' \
  -L "https://api.app.shortcut.com/api/v3/stories"
```

## Request Parameters

Below are the parameters that can be included when creating a story:

### CreateStoryParams

| Name | Type | Description |
|------|------|-------------|
| `name` | String (512) | **Required.** The name of the story. |
| `workflow_state_id` | Integer | **Required.** The ID of the workflow state the story will be in. |
| `archived` | Boolean | Controls the story's archived state. |
| `comments` | Array [CreateStoryCommentParams] | An array of comments to add to the story. |
| `completed_at_override` | Date | A manual override for the time/date the Story was completed. |
| `created_at` | Date | The time/date the Story was created. |
| `custom_fields` | Array [CustomFieldValueParams] | A map specifying a CustomField ID and CustomFieldEnumValue ID that represents an assertion of some value for a CustomField. |
| `deadline` | Date or null | The due date of the story. |
| `description` | String (100000) | The description of the story. |
| `epic_id` | Integer or null | The ID of the epic the story belongs to. |
| `estimate` | Integer or null | The numeric point estimate of the story. Can also be null, which means unestimated. |
| `external_id` | String (1024) | This field can be set to another unique ID. In the case that the Story has been imported from another tool, the ID in the other tool can be indicated here. |
| `external_links` | Array [String] | An array of External Links associated with this story. |
| `file_ids` | Array [Integer] | An array of IDs of files attached to the story. |
| `follower_ids` | Array [UUID] | An array of UUIDs of the followers of this story. |
| `group_id` | UUID or null | The id of the group to associate with this story. |
| `iteration_id` | Integer or null | The ID of the iteration the story belongs to. |
| `labels` | Array [CreateLabelParams] | An array of labels attached to the story. |
| `linked_file_ids` | Array [Integer] | An array of IDs of linked files attached to the story. |
| `move_to` | Enum (first, last) | One of "first" or "last". This can be used to move the given story to the first or last position in the workflow state. |
| `owner_ids` | Array [UUID] | An array of UUIDs of the owners of this story. |
| `project_id` | Integer or null | The ID of the project the story belongs to. |
| `requested_by_id` | UUID | The ID of the member that requested the story. |
| `source_task_id` | Integer or null | Given this story was converted from a task in another story, this is the original task ID that was converted to this story. |
| `started_at_override` | Date | A manual override for the time/date the Story was started. |
| `story_links` | Array [CreateStoryLinkParams] | An array of story links attached to the story. |
| `story_template_id` | UUID or null | The id of the story template used to create this story, if applicable. This is just an association; no content from the story template is inherited by the story simply by setting this field. |
| `story_type` | Enum (bug, chore, feature) | The type of story (feature, bug, chore). |
| `tasks` | Array [CreateTaskParams] | An array of tasks connected to the story. |
| `updated_at` | Date | The time/date the Story was updated. |

### CreateStoryCommentParams

| Name | Type | Description |
|------|------|-------------|
| `author_id` | UUID | The ID of the member that created the comment. |
| `created_at` | Date | The time/date the comment was created. |
| `external_id` | String or null | This field can be set to another unique ID. |
| `parent_id` | Integer or null | The ID of the parent comment. |
| `text` | String or null | The comment text. |
| `updated_at` | Date | The time/date the comment was updated. |

### CreateTaskParams

| Name | Type | Description |
|------|------|-------------|
| `complete` | Boolean | True/false boolean indicating whether the Task is completed. Defaults to false. |
| `created_at` | Date | Defaults to the time/date the Task is created but can be set to reflect another creation time/date. |
| `description` | String (2048) | The Task description. |
| `external_id` | String (128) | This field can be set to another unique ID. In the case that the Task has been imported from another tool, the ID in the other tool can be indicated here. |
| `owner_ids` | Array [UUID] | An array of UUIDs for any members you want to add as Owners on this new Task. |
| `updated_at` | Date | Defaults to the time/date the Task is created in Shortcut but can be set to reflect another time/date. |

### CustomFieldValueParams

| Name | Type | Description |
|------|------|-------------|
| `field_id` | UUID | The unique public ID for the CustomField. |
| `value` | String | A literal value for the CustomField. Currently ignored. |
| `value_id` | UUID | The ID of the CustomFieldEnumValue. |

### CreateLabelParams

| Name | Type | Description |
|------|------|-------------|
| `color` | String | The hex color to be displayed with the Label (for example, "#ff0000"). |
| `description` | String (1024) | The description of the new Label. |
| `external_id` | String (128) | This field can be set to another unique ID. In the case that the Label has been imported from another tool, the ID in the other tool can be indicated here. |
| `name` | String (128) | The name of the new Label. |

### CreateStoryLinkParams

| Name | Type | Description |
|------|------|-------------|
| `object_id` | Integer | The unique ID of the Story defined as object. |
| `subject_id` | Integer | The unique ID of the Story defined as subject. |
| `verb` | Enum (blocks, duplicates, relates to) | How the subject Story acts on the object Story. This can be "blocks", "duplicates", or "relates to". |

## Response Example

```json
{
  "app_url": "https://app.shortcut.com/organization/story/123",
  "archived": false,
  "blocked": false,
  "blocker": false,
  "comments": [],
  "completed": false,
  "created_at": "2023-04-19T14:30:00Z",
  "description": "Story description",
  "entity_type": "story",
  "epic_id": null,
  "estimate": null,
  "external_id": null,
  "external_links": [],
  "follower_ids": [],
  "group_id": null,
  "id": 123,
  "iteration_id": null,
  "labels": [],
  "name": "New Story",
  "owner_ids": [],
  "project_id": null,
  "requested_by_id": "12345678-9012-3456-7890-123456789012",
  "started": false,
  "story_type": "feature",
  "tasks": [],
  "updated_at": "2023-04-19T14:30:00Z",
  "workflow_state_id": 123
}
```

## Response Status Codes

| Code | Description |
|------|-------------|
| 201  | Story created successfully |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Notes for React Implementation

When implementing this API in a React application:

1. Ensure you're storing your API token securely, preferably in environment variables.
2. Remember that either `workflow_state_id` or `project_id` must be provided, but not both.
3. Handle API responses appropriately, checking status codes for errors.
4. Consider implementing proper form validation before submitting requests.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface CreateStoryParams {
  name: string;
  workflow_state_id?: number;
  project_id?: number;
  description?: string;
  story_type?: 'bug' | 'chore' | 'feature';
  estimate?: number | null;
  epic_id?: number | null;
  labels?: CreateLabelParams[];
  tasks?: CreateTaskParams[];
  owner_ids?: string[]; // Array of UUIDs
  follower_ids?: string[]; // Array of UUIDs
  iteration_id?: number | null;
  custom_fields?: CustomFieldValueParams[];
  story_links?: CreateStoryLinkParams[];
  // Additional fields as needed
}

interface CreateLabelParams {
  name?: string;
  color?: string;
  description?: string;
  external_id?: string;
}

interface CreateTaskParams {
  description?: string;
  complete?: boolean;
  owner_ids?: string[]; // Array of UUIDs
  created_at?: string;
  updated_at?: string;
  external_id?: string;
}

interface CustomFieldValueParams {
  field_id: string; // UUID
  value?: string;
  value_id?: string; // UUID
}

interface CreateStoryLinkParams {
  object_id: number;
  subject_id: number;
  verb: 'blocks' | 'duplicates' | 'relates to';
}

interface Story {
  id: number;
  name: string;
  description?: string;
  story_type: string;
  workflow_state_id: number;
  // Other response fields as needed
}
```

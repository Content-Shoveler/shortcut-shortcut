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

| Name | Type | Description |
|------|------|-------------|
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
| `name` | String (512) | Required. The name of the story. |
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
| `workflow_state_id` | Integer | Required. The ID of the workflow state the story will be in. |

## Parameter Types

### CreateStoryCommentParams

| Name | Type | Description |
|------|------|-------------|
| `author_id` | UUID | The ID of the member that created the comment. |
| `created_at` | Date | The time/date the comment was created. |
| `external_id` | String or null | This field can be set to another unique ID. |
| `parent_id` | Integer or null | The ID of the parent comment. |
| `text` | String or null | The comment text. |
| `updated_at` | Date | The time/date the comment was updated. |

### CustomFieldValueParams

| Name | Type | Description |
|------|------|-------------|
| `field_id` | UUID | The ID of the CustomField. |
| `value` | String | The value of the CustomField. |
| `value_id` | UUID | The ID of the CustomFieldEnumValue. |

### CreateLabelParams

| Name | Type | Description |
|------|------|-------------|
| `color` | String | The hex color to be displayed with the Label. |
| `description` | String or null | The description of the Label. |
| `external_id` | String or null | This field can be set to another unique ID. |
| `name` | String or null | The name of the Label. |

### CreateTaskParams

| Name | Type | Description |
|------|------|-------------|
| `complete` | Boolean | True if the task is completed, false otherwise. |
| `created_at` | Date | The time/date the Task was created. |
| `description` | String or null | The description of the Task. |
| `external_id` | String or null | This field can be set to another unique ID. |
| `owner_ids` | Array [UUID] | An array of UUIDs for the Task's owners. |
| `updated_at` | Date | The time/date the Task was updated. |

### CreateStoryLinkParams

| Name | Type | Description |
|------|------|-------------|
| `object_id` | Integer | The ID of the object Story. |
| `subject_id` | Integer | The ID of the subject Story. |
| `verb` | String | The type of link. One of "blocks", "duplicates", "relates to". |

## Response Status Codes

| Code | Description |
|------|-------------|
| 201  | Story created successfully |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

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

## Notes for React Implementation

When implementing this API in a React application:

1. Ensure you're storing your API token securely, preferably in environment variables.
2. Remember that either `workflow_state_id` or `project_id` must be provided, but not both.
3. Handle API responses appropriately, checking status codes for errors.
4. Consider implementing proper form validation before submitting requests.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface CreateStoryRequest {
  name: string;                    // Required
  description?: string;
  story_type?: 'bug' | 'chore' | 'feature';
  workflow_state_id?: number;      // Either this or project_id is required
  project_id?: number;             // Either this or workflow_state_id is required
  estimate?: number | null;
  // Add other fields as needed for your implementation
}

interface Story {
  id: number;
  name: string;
  description: string;
  story_type: string;
  workflow_state_id: number;
  // Other fields from the response as needed
}
```

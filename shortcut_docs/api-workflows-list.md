# Workflows

## List Workflows

Returns a list of all Workflows in the Workspace.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/workflows
```

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/workflows"
```

### Response Example

```json
[
  {
    "auto_assign_owner": true,
    "created_at": "2016-12-31T12:30:00Z",
    "default_state_id": 123,
    "description": "foo",
    "entity_type": "foo",
    "id": 123,
    "name": "foo",
    "project_ids": [123],
    "states": [{
      "color": "#6515dd",
      "created_at": "2016-12-31T12:30:00Z",
      "description": "foo",
      "entity_type": "foo",
      "id": 123,
      "name": "foo",
      "num_stories": 123,
      "num_story_templates": 123,
      "position": 123,
      "type": "foo",
      "updated_at": "2016-12-31T12:30:00Z",
      "verb": "foo"
    }],
    "team_id": 123,
    "updated_at": "2016-12-31T12:30:00Z"
  }
]
```

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | Array of Workflow objects |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Get Workflow

Get Workflow returns information about a chosen Workflow.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/workflows/{workflow-public-id}
```

### URL Parameters

| Name | Type | Description |
|------|------|-------------|
| `workflow-public-id` | Integer | **Required.** The ID of the Workflow. |

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/workflows/123"
```

### Response Example

```json
{
  "auto_assign_owner": true,
  "created_at": "2016-12-31T12:30:00Z",
  "default_state_id": 123,
  "description": "foo",
  "entity_type": "foo",
  "id": 123,
  "name": "foo",
  "project_ids": [123],
  "states": [{
    "color": "#6515dd",
    "created_at": "2016-12-31T12:30:00Z",
    "description": "foo",
    "entity_type": "foo",
    "id": 123,
    "name": "foo",
    "num_stories": 123,
    "num_story_templates": 123,
    "position": 123,
    "type": "foo",
    "updated_at": "2016-12-31T12:30:00Z",
    "verb": "foo"
  }],
  "team_id": 123,
  "updated_at": "2016-12-31T12:30:00Z"
}
```

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | Workflow object |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Response Object Structure

### Workflow Object

| Field | Type | Description |
|-------|------|-------------|
| `auto_assign_owner` | Boolean | Whether owners are automatically assigned when stories are started. |
| `created_at` | Date | The date the Workflow was created. |
| `default_state_id` | Integer | The ID of the default state for the workflow. |
| `description` | String | The description of the workflow. |
| `entity_type` | String | The type of entity. |
| `id` | Integer | The unique ID of the workflow. |
| `name` | String | The name of the workflow. |
| `project_ids` | Array[Integer] | The IDs of projects associated with this workflow. |
| `states` | Array[WorkflowState] | The workflow states that stories pass through in this workflow. |
| `team_id` | Integer | The ID of the team the workflow belongs to. |
| `updated_at` | Date | The date the workflow was last updated. |

### WorkflowState Object

| Field | Type | Description |
|-------|------|-------------|
| `color` | String | The hex color for the workflow state. |
| `created_at` | Date | The date the workflow state was created. |
| `description` | String | The description of the workflow state. |
| `entity_type` | String | The type of entity. |
| `id` | Integer | The unique ID of the workflow state. |
| `name` | String | The name of the workflow state. |
| `num_stories` | Integer | The number of stories in this workflow state. |
| `num_story_templates` | Integer | The number of story templates associated with this workflow state. |
| `position` | Integer | The position of the workflow state in the workflow. |
| `type` | String | The type of workflow state (e.g., "unstarted", "started", "done"). |
| `updated_at` | Date | The date the workflow state was last updated. |
| `verb` | String | The verb that describes this workflow state. |

## Notes for React Implementation

When implementing this API in a React application:

1. The List Workflows endpoint is useful for retrieving all available workflows and their states.
2. Workflow states are essential when creating or updating stories, as each story must be associated with a workflow state.
3. The `default_state_id` can be used as a fallback when creating new stories if no specific state is selected.
4. When displaying workflows in your UI, you can use the `states` array to show the progression of story states.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface WorkflowState {
  id: number;
  name: string;
  color: string;
  description?: string;
  position: number;
  type: string;
  num_stories: number;
  verb?: string;
  created_at: string;
  updated_at: string;
}

interface Workflow {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  auto_assign_owner: boolean;
  default_state_id: number;
  team_id: number;
  states: WorkflowState[];
  project_ids: number[];
}
```

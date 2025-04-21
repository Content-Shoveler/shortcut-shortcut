# Epic Workflow

## Get Epic Workflow

Returns the Epic Workflow for the Workspace.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/epic-workflow
```

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/epic-workflow"
```

### Response Example

```json
{
  "created_at": "2016-12-31T12:30:00Z",
  "default_epic_state_id": 123,
  "entity_type": "foo",
  "epic_states": [{
    "color": "#6515dd",
    "created_at": "2016-12-31T12:30:00Z",
    "description": "foo",
    "entity_type": "foo",
    "id": 123,
    "name": "foo",
    "position": 123,
    "type": "foo",
    "updated_at": "2016-12-31T12:30:00Z"
  }],
  "id": 123,
  "updated_at": "2016-12-31T12:30:00Z"
}
```

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | EpicWorkflow object |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Response Object Structure

### EpicWorkflow Object

| Field | Type | Description |
|-------|------|-------------|
| `created_at` | Date | The date the Epic Workflow was created. |
| `default_epic_state_id` | Integer | The ID of the default state for new Epics. |
| `entity_type` | String | The type of entity. |
| `epic_states` | Array[EpicState] | The states that Epics can be in. |
| `id` | Integer | The unique ID of the Epic Workflow. |
| `updated_at` | Date | The date the Epic Workflow was last updated. |

### EpicState Object

| Field | Type | Description |
|-------|------|-------------|
| `color` | String | The hex color for the Epic State. |
| `created_at` | Date | The date the Epic State was created. |
| `description` | String | The description of the Epic State. |
| `entity_type` | String | The type of entity. |
| `id` | Integer | The unique ID of the Epic State. |
| `name` | String | The name of the Epic State. |
| `position` | Integer | The position of the Epic State in the workflow. |
| `type` | String | The type of Epic State (e.g., "to do", "in progress", "done"). |
| `updated_at` | Date | The date the Epic State was last updated. |

## Notes for React Implementation

When implementing this API in a React application:

1. The Epic Workflow defines the possible states that Epics can move through in your workspace.
2. The `default_epic_state_id` indicates which state is automatically assigned to new Epics.
3. When creating an Epic, you can use one of the `epic_states` IDs as the `epic_state_id` parameter.
4. Epic states can be used to filter or group Epics in your UI based on their current state.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface EpicState {
  id: number;
  name: string;
  color: string;
  description?: string;
  position: number;
  type: string;
  created_at: string;
  updated_at: string;
}

interface EpicWorkflow {
  id: number;
  default_epic_state_id: number;
  epic_states: EpicState[];
  created_at: string;
  updated_at: string;
}
```

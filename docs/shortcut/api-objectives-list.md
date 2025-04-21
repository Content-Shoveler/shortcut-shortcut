# Objectives

## List Objectives

List Objectives returns a list of all Objectives and their attributes.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/objectives
```

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/objectives"
```

### Response Example

```json
[
  {
    "app_url": "foo",
    "archived": true,
    "categories": [{
      "archived": true,
      "color": "#6515dd",
      "created_at": "2016-12-31T12:30:00Z",
      "entity_type": "foo",
      "external_id": "foo",
      "id": 123,
      "name": "foo",
      "updated_at": "2016-12-31T12:30:00Z"
    }],
    "completed": true,
    "completed_at": "2016-12-31T12:30:00Z",
    "completed_at_override": "2016-12-31T12:30:00Z",
    "created_at": "2016-12-31T12:30:00Z",
    "description": "foo",
    "entity_type": "foo",
    "id": 123,
    "key_result_ids": ["12345678-9012-3456-7890-123456789012"],
    "name": "foo",
    "position": 123,
    "started": true,
    "started_at": "2016-12-31T12:30:00Z",
    "started_at_override": "2016-12-31T12:30:00Z",
    "state": "foo",
    "stats": {
      "average_cycle_time": 123,
      "average_lead_time": 123,
      "num_related_documents": 123
    },
    "updated_at": "2016-12-31T12:30:00Z"
  }
]
```

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | Array of Objective objects |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Response Object Structure

### Objective Object

| Field | Type | Description |
|-------|------|-------------|
| `app_url` | String | The URL of the Objective in the Shortcut app. |
| `archived` | Boolean | Whether the Objective has been archived or not. |
| `categories` | Array[Category] | The categories associated with this Objective. |
| `completed` | Boolean | Whether the Objective has been completed. |
| `completed_at` | Date | The time/date the Objective was completed. |
| `completed_at_override` | Date | A manual override for the time/date the Objective was completed. |
| `created_at` | Date | The time/date the Objective was created. |
| `description` | String | The description of the Objective. |
| `entity_type` | String | The type of entity. |
| `id` | Integer | The unique ID of the Objective. |
| `key_result_ids` | Array[UUID] | The IDs of Key Results associated with this Objective. |
| `name` | String | The name of the Objective. |
| `position` | Integer | The position of the Objective in the workspace. |
| `started` | Boolean | Whether the Objective has been started. |
| `started_at` | Date | The time/date the Objective was started. |
| `started_at_override` | Date | A manual override for the time/date the Objective was started. |
| `state` | String | The current state of the Objective. |
| `stats` | ObjectiveStats | Statistics about the Objective. |
| `updated_at` | Date | The time/date the Objective was last updated. |

### Category Object

| Field | Type | Description |
|-------|------|-------------|
| `archived` | Boolean | Whether the Category has been archived or not. |
| `color` | String | The hex color for the Category (e.g., "#6515DD"). |
| `created_at` | Date | The time/date the Category was created. |
| `entity_type` | String | The type of entity. |
| `external_id` | String | An additional ID that can be associated with the Category. |
| `id` | Integer | The unique ID of the Category. |
| `name` | String | The name of the Category. |
| `updated_at` | Date | The time/date the Category was last updated. |

### ObjectiveStats Object

| Field | Type | Description |
|-------|------|-------------|
| `average_cycle_time` | Integer | The average cycle time (in seconds) of stories in this Objective. |
| `average_lead_time` | Integer | The average lead time (in seconds) of stories in this Objective. |
| `num_related_documents` | Integer | The number of documents related to this Objective. |

## Notes for React Implementation

When implementing this API in a React application:

1. The List Objectives endpoint retrieves all objectives in the workspace, which can be used to display OKRs (Objectives and Key Results).
2. Objectives can be filtered by their `state`, `archived` status, or associated `categories`.
3. The `stats` field provides metrics that can be useful for reporting on Objective progress.
4. Objectives can be linked to Epics in your workspace, allowing for a hierarchical organization of work.
5. The `key_result_ids` can be used to fetch associated Key Results for a complete OKR view.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface Category {
  id: number;
  name: string;
  color: string;
  archived: boolean;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

interface ObjectiveStats {
  average_cycle_time: number;
  average_lead_time: number;
  num_related_documents: number;
}

interface Objective {
  id: number;
  name: string;
  description?: string;
  state: string;
  archived: boolean;
  completed: boolean;
  started: boolean;
  position: number;
  app_url: string;
  completed_at?: string;
  started_at?: string;
  completed_at_override?: string;
  started_at_override?: string;
  categories: Category[];
  key_result_ids: string[];  // Array of UUIDs
  stats: ObjectiveStats;
  created_at: string;
  updated_at: string;
}
```

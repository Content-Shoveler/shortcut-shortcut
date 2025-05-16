# Groups

## List Groups

A group in our API maps to a "Team" within the Shortcut Product. A Team is a collection of Users that can be associated to Stories, Epics, and Iterations within Shortcut.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/groups
```

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/groups"
```

### Response Example

```json
[
  {
    "app_url": "foo",
    "archived": true,
    "color": "#6515dd",
    "color_key": "black",
    "description": "foo",
    "display_icon": {
      "created_at": "2016-12-31T12:30:00Z",
      "entity_type": "foo",
      "id": "12345678-9012-3456-7890-123456789012",
      "updated_at": "2016-12-31T12:30:00Z",
      "url": "foo"
    },
    "entity_type": "foo",
    "id": "12345678-9012-3456-7890-123456789012",
    "member_ids": ["12345678-9012-3456-7890-123456789012"],
    "mention_name": "foo",
    "name": "foo",
    "num_epics_started": 123,
    "num_stories": 123,
    "num_stories_backlog": 123,
    "num_stories_started": 123,
    "workflow_ids": [123]
  }
]
```

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | Array of Group objects |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Response Object Structure

### Group Object

| Field | Type | Description |
|-------|------|-------------|
| `app_url` | String | The URL of the Group in the Shortcut app. |
| `archived` | Boolean | Whether the Group has been archived or not. |
| `color` | String | The hex color associated with the Group (e.g., "#6515DD"). |
| `color_key` | String | The color key associated with the Group (e.g., "black", "blue", etc.). |
| `description` | String | The description of the Group. |
| `display_icon` | DisplayIcon | The display icon associated with the Group. |
| `entity_type` | String | The type of entity. |
| `id` | UUID | The unique ID of the Group. |
| `member_ids` | Array[UUID] | An array of UUIDs for Members currently in the Group. |
| `mention_name` | String | The mention name for the Group. |
| `name` | String | The name of the Group. |
| `num_epics_started` | Integer | The number of started Epics associated with the Group. |
| `num_stories` | Integer | The total number of Stories associated with the Group. |
| `num_stories_backlog` | Integer | The number of Stories in the backlog associated with the Group. |
| `num_stories_started` | Integer | The number of started Stories associated with the Group. |
| `workflow_ids` | Array[Integer] | An array of Workflow IDs associated with the Group. |

### DisplayIcon Object

| Field | Type | Description |
|-------|------|-------------|
| `created_at` | Date | The time/date the DisplayIcon was created. |
| `entity_type` | String | The type of entity. |
| `id` | UUID | The unique ID of the DisplayIcon. |
| `updated_at` | Date | The time/date the DisplayIcon was last updated. |
| `url` | String | The URL of the DisplayIcon. |

## Notes for React Implementation

When implementing this API in a React application:

1. Groups map to "Teams" in the Shortcut UI, so use that terminology when displaying to users.
2. The `member_ids` array can be used to filter stories or other entities by team membership.
3. The `color` and `color_key` fields can be used for consistent visual representation of teams across your UI.
4. Team statistics (num_stories, num_epics_started, etc.) can be used for dashboard displays or reporting.
5. Consider filtering out archived groups (`archived: true`) from active team selections.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface DisplayIcon {
  id: string;  // UUID
  url: string;
  created_at: string;
  updated_at: string;
}

interface Group {
  id: string;  // UUID
  name: string;
  mention_name: string;
  description?: string;
  archived: boolean;
  color: string;
  color_key: string;
  app_url: string;
  member_ids: string[];  // Array of UUIDs
  workflow_ids: number[];
  display_icon?: DisplayIcon;
  num_epics_started: number;
  num_stories: number;
  num_stories_backlog: number;
  num_stories_started: number;
}
```

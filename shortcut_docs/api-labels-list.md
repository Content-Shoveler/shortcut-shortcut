# Labels

## List Labels

List Labels returns a list of all Labels and their attributes.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/labels
```

### URL Query Parameters

| Name | Type | Description |
|------|------|-------------|
| `slim` | Boolean | A true/false boolean indicating if the slim versions of the Label should be returned. |

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/labels"
```

### Example Request with Query Parameters

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/labels?slim=true"
```

### Response Example

```json
[
  {
    "app_url": "foo",
    "archived": true,
    "color": "#6515dd",
    "created_at": "2016-12-31T12:30:00Z",
    "description": "foo",
    "entity_type": "foo",
    "external_id": "foo",
    "id": 123,
    "name": "foo",
    "stats": {
      "num_epics": 123,
      "num_epics_completed": 123,
      "num_epics_in_progress": 123,
      "num_epics_total": 123,
      "num_epics_unstarted": 123,
      "num_points_backlog": 123,
      "num_points_completed": 123,
      "num_points_in_progress": 123,
      "num_points_total": 123,
      "num_points_unstarted": 123,
      "num_related_documents": 123,
      "num_stories_backlog": 123,
      "num_stories_completed": 123,
      "num_stories_in_progress": 123,
      "num_stories_total": 123,
      "num_stories_unestimated": 123,
      "num_stories_unstarted": 123
    },
    "updated_at": "2016-12-31T12:30:00Z"
  }
]
```

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | Array of Label objects |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Response Object Structure

### Label Object

| Field | Type | Description |
|-------|------|-------------|
| `app_url` | String | The URL of the Label in the Shortcut app. |
| `archived` | Boolean | Whether the Label has been archived or not. |
| `color` | String | The hex color for the Label (e.g., "#6515DD"). |
| `created_at` | Date | The date the Label was created. |
| `description` | String | The description of the Label. |
| `entity_type` | String | The type of entity. |
| `external_id` | String | An additional ID that can be associated with the Label. |
| `id` | Integer | The unique ID of the Label. |
| `name` | String | The name of the Label. |
| `stats` | LabelStats | Statistics about the Label's usage. |
| `updated_at` | Date | The date the Label was last updated. |

### LabelStats Object

| Field | Type | Description |
|-------|------|-------------|
| `num_epics` | Integer | The number of epics with this label. |
| `num_epics_completed` | Integer | The number of completed epics with this label. |
| `num_epics_in_progress` | Integer | The number of in-progress epics with this label. |
| `num_epics_total` | Integer | The total number of epics with this label. |
| `num_epics_unstarted` | Integer | The number of unstarted epics with this label. |
| `num_points_backlog` | Integer | The number of points in the backlog with this label. |
| `num_points_completed` | Integer | The number of completed points with this label. |
| `num_points_in_progress` | Integer | The number of in-progress points with this label. |
| `num_points_total` | Integer | The total number of points with this label. |
| `num_points_unstarted` | Integer | The number of unstarted points with this label. |
| `num_related_documents` | Integer | The number of documents related to this label. |
| `num_stories_backlog` | Integer | The number of stories in the backlog with this label. |
| `num_stories_completed` | Integer | The number of completed stories with this label. |
| `num_stories_in_progress` | Integer | The number of in-progress stories with this label. |
| `num_stories_total` | Integer | The total number of stories with this label. |
| `num_stories_unestimated` | Integer | The number of unestimated stories with this label. |
| `num_stories_unstarted` | Integer | The number of unstarted stories with this label. |

## Notes for React Implementation

When implementing this API in a React application:

1. The List Labels endpoint is useful for retrieving all labels available in the workspace.
2. Use the `slim=true` query parameter when you only need basic label information and want to minimize data transfer.
3. Labels can be used to filter stories and epics in your UI or to populate dropdown menus for labeling.
4. The `stats` field provides useful metrics that can be used for dashboards or reporting features.
5. Label colors can be used for visual representation in your UI.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface LabelStats {
  num_epics: number;
  num_epics_completed: number;
  num_epics_in_progress: number;
  num_epics_total: number;
  num_epics_unstarted: number;
  num_points_backlog: number;
  num_points_completed: number;
  num_points_in_progress: number;
  num_points_total: number;
  num_points_unstarted: number;
  num_related_documents: number;
  num_stories_backlog: number;
  num_stories_completed: number;
  num_stories_in_progress: number;
  num_stories_total: number;
  num_stories_unestimated: number;
  num_stories_unstarted: number;
}

interface Label {
  id: number;
  name: string;
  color: string;
  description?: string;
  external_id?: string;
  archived: boolean;
  app_url: string;
  stats?: LabelStats;
  created_at: string;
  updated_at: string;
}
```

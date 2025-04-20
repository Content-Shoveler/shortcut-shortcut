# Iterations

## List Iterations

Returns a list of all Iterations in the Workspace.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/iterations
```

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/iterations"
```

### Response Example

```json
[
  {
    "app_url": "foo",
    "created_at": "2016-12-31T12:30:00Z",
    "end_date": "2016-12-31T12:30:00Z",
    "entity_type": "foo",
    "follower_ids": ["12345678-9012-3456-7890-123456789012"],
    "group_ids": ["12345678-9012-3456-7890-123456789012"],
    "group_mention_ids": ["12345678-9012-3456-7890-123456789012"],
    "id": 123,
    "label_ids": [123],
    "labels": [{
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
    }],
    "member_mention_ids": ["12345678-9012-3456-7890-123456789012"],
    "mention_ids": ["12345678-9012-3456-7890-123456789012"],
    "name": "foo",
    "start_date": "2016-12-31T12:30:00Z",
    "stats": {
      "average_cycle_time": 123,
      "average_lead_time": 123,
      "num_points": 123,
      "num_points_backlog": 123,
      "num_points_done": 123,
      "num_points_started": 123,
      "num_points_unstarted": 123,
      "num_related_documents": 123,
      "num_stories_backlog": 123,
      "num_stories_done": 123,
      "num_stories_started": 123,
      "num_stories_unestimated": 123,
      "num_stories_unstarted": 123
    },
    "status": "foo",
    "updated_at": "2016-12-31T12:30:00Z"
  }
]
```

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | Array of IterationSlim objects |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Response Object Structure

### IterationSlim Object

| Field | Type | Description |
|-------|------|-------------|
| `app_url` | String | The URL of the Iteration in the Shortcut app. |
| `created_at` | Date | The time/date the Iteration was created. |
| `end_date` | Date | The date this Iteration ends. |
| `entity_type` | String | The type of entity. |
| `follower_ids` | Array[UUID] | The IDs of the Members who are following this Iteration. |
| `group_ids` | Array[UUID] | The IDs of the Groups associated with this Iteration. |
| `group_mention_ids` | Array[UUID] | The IDs of Groups mentioned in the Iteration description. |
| `id` | Integer | The unique ID of the Iteration. |
| `label_ids` | Array[Integer] | The IDs of Labels attached to the Iteration. |
| `labels` | Array[Label] | Labels attached to the Iteration. |
| `member_mention_ids` | Array[UUID] | The IDs of Members mentioned in the Iteration description. |
| `mention_ids` | Array[UUID] | The IDs of Members or Groups mentioned in the Iteration description. |
| `name` | String | The name of the Iteration. |
| `start_date` | Date | The date this Iteration begins. |
| `stats` | IterationStats | Statistics about the Iteration. |
| `status` | String | The status of the Iteration (e.g., "unstarted", "started", "done"). |
| `updated_at` | Date | The time/date the Iteration was last updated. |

### Label Object

| Field | Type | Description |
|-------|------|-------------|
| `app_url` | String | The URL of the Label in the Shortcut app. |
| `archived` | Boolean | Whether the Label is archived or not. |
| `color` | String | The hex color for the Label (e.g., "#6515DD"). |
| `created_at` | Date | The time/date the Label was created. |
| `description` | String | The description of the Label. |
| `entity_type` | String | The type of entity. |
| `external_id` | String | An external ID that can be associated with the Label. |
| `id` | Integer | The unique ID of the Label. |
| `name` | String | The name of the Label. |
| `stats` | LabelStats | Statistics about the Label. |
| `updated_at` | Date | The time/date the Label was last updated. |

### IterationStats Object

| Field | Type | Description |
|-------|------|-------------|
| `average_cycle_time` | Integer | The average cycle time (in seconds) of completed stories in this Iteration. |
| `average_lead_time` | Integer | The average lead time (in seconds) of completed stories in this Iteration. |
| `num_points` | Integer | The total number of points in this Iteration. |
| `num_points_backlog` | Integer | The number of points in the backlog (not started or done) for this Iteration. |
| `num_points_done` | Integer | The number of completed points in this Iteration. |
| `num_points_started` | Integer | The number of points in started stories for this Iteration. |
| `num_points_unstarted` | Integer | The number of points in stories that aren't started for this Iteration. |
| `num_related_documents` | Integer | The number of documents related to this Iteration. |
| `num_stories_backlog` | Integer | The number of stories in the backlog for this Iteration. |
| `num_stories_done` | Integer | The number of completed stories in this Iteration. |
| `num_stories_started` | Integer | The number of started stories in this Iteration. |
| `num_stories_unestimated` | Integer | The number of stories with no point estimate for this Iteration. |
| `num_stories_unstarted` | Integer | The number of stories not started for this Iteration. |

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

1. The List Iterations endpoint retrieves information about all iterations in your workspace, which is useful for sprint planning and tracking.
2. Iterations have start and end dates that can be used to filter stories or display timeline visualizations.
3. The `stats` field provides comprehensive metrics about the progress of work within an iteration, which can be used for burndown charts and other progress visualizations.
4. Iterations can be associated with specific groups, which can be useful for team-specific sprint planning.
5. The status field indicates the current state of the iteration, which can be used to filter or categorize iterations in your UI.

## TypeScript Type Definiti

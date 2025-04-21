# Create Epic

Create Epic allows you to create a new Epic in Shortcut.

## API Endpoint

```
POST https://api.app.shortcut.com/api/v3/epics
```

## Example Request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -d '{ 
    "name": "New Epic",
    "description": "Epic description", 
    "epic_state_id": 123
  }' \
  -L "https://api.app.shortcut.com/api/v3/epics"
```

## Request Parameters

| Name | Type | Description |
|------|------|-------------|
| `completed_at_override` | Date | A manual override for the time/date the Epic was completed. |
| `created_at` | Date | Defaults to the time/date it is created but can be set to reflect another date. |
| `deadline` | Date or null | The Epic's deadline. |
| `description` | String (100000) | The Epic's description. |
| `epic_state_id` | Integer | The ID of the Epic State. |
| `external_id` | String (128) | This field can be set to another unique ID. In the case that the Epic has been imported from another tool, the ID in the other tool can be indicated here. |
| `follower_ids` | Array [UUID] | An array of UUIDs for any Members you want to add as Followers on this new Epic. |
| `group_id` | UUID or null | Deprecated. The ID of the group to associate with the epic. Use group_ids. |
| `group_ids` | Array [UUID] | An array of UUIDS for Groups to which this Epic is related. |
| `labels` | Array [CreateLabelParams] | An array of Labels attached to the Epic. |
| `milestone_id` | Integer or null | Deprecated. The ID of the Milestone this Epic is related to. Use objective_ids. |
| `name` | String (256) | Required. The Epic's name. |
| `objective_ids` | Array [Integer] | An array of IDs for Objectives to which this Epic is related. |
| `owner_ids` | Array [UUID] | An array of UUIDs for any members you want to add as Owners on this new Epic. |
| `planned_start_date` | Date or null | The Epic's planned start date. |
| `requested_by_id` | UUID | The ID of the member that requested the epic. |
| `started_at_override` | Date | A manual override for the time/date the Epic was started. |
| `state` | Enum (done, in progress, to do) | Deprecated. The Epic's state (to do, in progress, or done); will be ignored when epic_state_id is set. |
| `updated_at` | Date | Defaults to the time/date it is created but can be set to reflect another date. |

## Parameter Types

### CreateLabelParams

| Name | Type | Description |
|------|------|-------------|
| `color` | String | The hex color to be displayed with the Label (e.g., "#6515DD"). |
| `description` | String or null | The description of the Label. |
| `external_id` | String or null | This field can be set to another unique ID. |
| `name` | String or null | The name of the Label. |

## Response Status Codes

| Code | Description |
|------|-------------|
| 201  | Epic created successfully |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Response Example

```json
{
  "app_url": "https://app.shortcut.com/organization/epic/123",
  "archived": false,
  "completed": false,
  "completed_at": null,
  "created_at": "2023-04-19T14:30:00Z",
  "deadline": null,
  "description": "Epic description",
  "entity_type": "epic",
  "epic_state_id": 123,
  "external_id": null,
  "follower_ids": [],
  "group_ids": [],
  "id": 123,
  "labels": [],
  "name": "New Epic",
  "objective_ids": [],
  "owner_ids": [],
  "planned_start_date": null,
  "position": 1,
  "requested_by_id": "12345678-9012-3456-7890-123456789012",
  "started": false,
  "stats": {
    "num_points": 0,
    "num_points_done": 0,
    "num_points_started": 0,
    "num_points_unstarted": 0,
    "num_stories_done": 0,
    "num_stories_started": 0,
    "num_stories_total": 0,
    "num_stories_unstarted": 0
  },
  "updated_at": "2023-04-19T14:30:00Z"
}
```

## Notes for React Implementation

When implementing this API in a React application:

1. Ensure you're storing your API token securely, preferably in environment variables.
2. At minimum, you must provide a `name` for the Epic.
3. It's recommended to also provide an `epic_state_id` for proper workflow placement.
4. Handle API responses appropriately, checking status codes for errors.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface CreateEpicRequest {
  name: string;                    // Required
  description?: string;
  epic_state_id?: number;
  deadline?: string | null;        // ISO date format
  planned_start_date?: string | null; // ISO date format
  owner_ids?: string[];            // Array of UUIDs
  follower_ids?: string[];         // Array of UUIDs
  // Add other fields as needed for your implementation
}

interface Epic {
  id: number;
  name: string;
  description: string;
  epic_state_id: number;
  deadline: string | null;
  // Other fields from the response as needed
}
```

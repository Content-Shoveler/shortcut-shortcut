# Members

## List Members

Returns information about members of the Workspace.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/members
```

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/members"
```

### Response Example

```json
[
  {
    "created_at": "2016-12-31T12:30:00Z",
    "disabled": true,
    "entity_type": "foo",
    "group_ids": ["12345678-9012-3456-7890-123456789012"],
    "id": "12345678-9012-3456-7890-123456789012",
    "profile": {
      "deactivated": true,
      "display_icon": {
        "created_at": "2016-12-31T12:30:00Z",
        "entity_type": "foo",
        "id": "12345678-9012-3456-7890-123456789012",
        "updated_at": "2016-12-31T12:30:00Z",
        "url": "foo"
      },
      "email_address": "foo",
      "entity_type": "foo",
      "gravatar_hash": "foo",
      "id": "12345678-9012-3456-7890-123456789012",
      "is_owner": true,
      "mention_name": "foo",
      "name": "foo",
      "two_factor_auth_activated": true
    },
    "role": "foo",
    "state": "disabled",
    "updated_at": "2016-12-31T12:30:00Z"
  }
]
```

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | Array of Member objects |
| 400  | Schema mismatch |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Response Object Structure

### Member Object

| Field | Type | Description |
|-------|------|-------------|
| `created_at` | Date | The date the Member was created. |
| `disabled` | Boolean | Whether the Member has been disabled or not. |
| `entity_type` | String | The type of entity. |
| `group_ids` | Array[UUID] | The IDs of the Groups the Member is in. |
| `id` | UUID | The unique ID of the Member. |
| `profile` | Profile | The Member's profile. |
| `role` | String | The Member's role in the Workspace. |
| `state` | String | The state of the Member (e.g., "active", "disabled"). |
| `updated_at` | Date | The date the Member was last updated. |

### Profile Object

| Field | Type | Description |
|-------|------|-------------|
| `deactivated` | Boolean | Whether the Member's profile has been deactivated. |
| `display_icon` | DisplayIcon | The Member's display icon. |
| `email_address` | String | The Member's email address. |
| `entity_type` | String | The type of entity. |
| `gravatar_hash` | String | The Member's gravatar hash. |
| `id` | UUID | The unique ID of the Profile. |
| `is_owner` | Boolean | Whether the Member is an owner of the Workspace. |
| `mention_name` | String | The Member's mention name. |
| `name` | String | The Member's name. |
| `two_factor_auth_activated` | Boolean | Whether the Member has two-factor authentication activated. |

### DisplayIcon Object

| Field | Type | Description |
|-------|------|-------------|
| `created_at` | Date | The date the DisplayIcon was created. |
| `entity_type` | String | The type of entity. |
| `id` | UUID | The unique ID of the DisplayIcon. |
| `updated_at` | Date | The date the DisplayIcon was last updated. |
| `url` | String | The URL of the DisplayIcon. |

## Notes for React Implementation

When implementing this API in a React application:

1. The List Members endpoint is useful for retrieving information about all members in the workspace.
2. Member IDs are used in various other API endpoints to associate stories, epics, and other entities with members.
3. You can use this endpoint to populate dropdowns for assigning owners, requesters, or followers to stories and epics.
4. Member information can be used to display avatars, names, and roles in your UI.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface DisplayIcon {
  id: string;  // UUID
  url: string;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;  // UUID
  name: string;
  mention_name: string;
  email_address: string;
  gravatar_hash: string;
  deactivated: boolean;
  is_owner: boolean;
  two_factor_auth_activated: boolean;
  display_icon?: DisplayIcon;
}

interface Member {
  id: string;  // UUID
  profile: Profile;
  role: string;
  state: string;
  disabled: boolean;
  group_ids: string[];  // Array of UUIDs
  created_at: string;
  updated_at: string;
}
```

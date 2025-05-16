# Workspace Info

## Get Workspace Info

Returns basic information about the current Workspace, including the estimate scale, as part of the Member Info response.

### API Endpoint

```
GET https://api.app.shortcut.com/api/v3/member
```

### Example Request

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -L "https://api.app.shortcut.com/api/v3/member"
```

### Response Example

```json
{
  "id": "12345678-9012-3456-7890-123456789012",
  "mention_name": "john",
  "name": "John Doe",
  "workspace2": {
    "estimate_scale": [1, 2, 3, 5, 8],
    "url_slug": "myworkspace",
    "utc_offset": "+00:00"
  }
}
```

### Response Object Structure

The response contains a `MemberInfo` object that includes the `workspace2` field:

#### MemberInfo Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | The unique identifier of the member. |
| `mention_name` | String | The mention name for the member. |
| `name` | String | The full name of the member. |
| `workspace2` | BasicWorkspaceInfo | Basic information about the workspace. |

#### BasicWorkspaceInfo Object

| Field | Type | Description |
|-------|------|-------------|
| `estimate_scale` | Array [Integer] | The estimate values that can be used for stories in this workspace (typically following Fibonacci sequence). |
| `url_slug` | String | The URL slug of the workspace. |
| `utc_offset` | String | The UTC offset for the workspace's timezone. |

### Response Status Codes

| Code | Description |
|------|-------------|
| 200  | MemberInfo object with BasicWorkspaceInfo |
| 400  | Schema mismatch |
| 401  | Unauthorized |
| 404  | Resource does not exist |
| 422  | Unprocessable |

## Notes for React Implementation

When implementing this API in a React application:

1. Use the `workspace2.estimate_scale` field to populate dropdown menus or UI elements for story point estimates.
2. This endpoint provides both member and workspace information, so it can be called on application initialization.
3. Store the estimate scale values in your application state for use throughout the application.

## TypeScript Type Definitions

These TypeScript interfaces can help with type checking in your React application:

```typescript
interface BasicWorkspaceInfo {
  estimate_scale: number[];
  url_slug: string;
  utc_offset: string;
}

interface MemberInfo {
  id: string;  // UUID
  mention_name: string;
  name: string;
  workspace2: BasicWorkspaceInfo;
}
```

## Example React Usage

Here's an example of how to retrieve the estimate scale from this endpoint:

```typescript
// Fetch member info including workspace estimate scale
const getEstimateScale = async () => {
  try {
    const response = await fetch('https://api.app.shortcut.com/api/v3/member', {
      headers: {
        'Content-Type': 'application/json',
        'Shortcut-Token': process.env.REACT_APP_SHORTCUT_API_TOKEN
      }
    });
    
    const data = await response.json();
    const estimateScale = data.workspace2.estimate_scale;
    
    // Use estimateScale in your application
    console.log('Available estimates:', estimateScale);
    return estimateScale;
  } catch (error) {
    console.error('Error fetching workspace info:', error);
  }
};
```

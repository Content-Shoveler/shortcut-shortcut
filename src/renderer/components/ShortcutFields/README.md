# ShortcutFields Framework

A modular, reusable system for Shortcut API field selectors in the Epic Template application.

## Overview

This framework provides a standardized way to create selectable fields that fetch data from the Shortcut API. It handles:
- Data fetching and caching
- Loading and error states
- Field dependencies (e.g., workflow states depend on the selected workflow)
- UI components for selecting values
- Type safety with TypeScript

## Architecture

```
ShortcutFields/
├── components.tsx   # React UI components
├── fieldDefinitions.ts  # Field type definitions
├── hooks.ts         # React hooks for state management
├── index.ts         # Public exports
├── registry.ts      # Registration system for fields
├── types.ts         # TypeScript type definitions
└── README.md        # Documentation
```

## Core Concepts

### Field Definitions

Each API-backed field is defined using the `FieldDefinition` interface, which specifies:
- How to fetch data from the API
- How to display options
- Dependencies on other fields
- UI labels and help text

Example field definition:
```typescript
const workflowField: FieldDefinition<ShortcutWorkflow> = {
  id: 'workflow',
  type: 'single',
  label: 'Workflow',
  helperText: 'Select a workflow',
  
  async fetch(api) {
    return api.fetchWorkflows();
  },
  
  getOptionLabel(workflow) {
    return workflow.name;
  },
  
  getOptionValue(workflow) {
    return workflow.id.toString();
  }
};
```

### Hooks

The framework provides hooks to manage field state:

- `useSingleField`: For standalone fields (e.g., workflow)
- `useDependentField`: For fields that depend on another (e.g., workflow state)
- `useField`: Automatically chooses the right hook based on field type
- `useRegisteredField`: Fetches a field definition from the registry and uses it

### Components

There are several levels of components to accommodate different use cases:

- `FieldSelector`: Base component for rendering a single field
- `DependentFieldSelector`: For parent-child field relationships
- Factory functions to create custom components from field definitions

### Registry

The registry manages available field types, allowing:
- Centralized field definitions
- Looking up fields by ID
- Managing field dependencies

## How to Use

### Basic Usage

To use a pre-built selector:

```tsx
import { WorkflowSelector } from '../ShortcutFields';

function MyComponent() {
  const [workflow, setWorkflow] = useState<ShortcutWorkflow | null>(null);
  
  return (
    <WorkflowSelector
      value={workflow}
      onChange={setWorkflow}
      fullWidth
    />
  );
}
```

### Using Dependent Fields

For fields that have dependencies:

```tsx
import { WorkflowAndStateSelector } from '../ShortcutFields';

function MyComponent() {
  const [workflow, setWorkflow] = useState<ShortcutWorkflow | null>(null);
  const [state, setState] = useState<ShortcutWorkflowState | null>(null);
  
  return (
    <WorkflowAndStateSelector
      parentValue={workflow}
      childValue={state}
      onParentChange={setWorkflow}
      onChildChange={setState}
      fullWidth
    />
  );
}
```

## Adding New Field Types

### 1. Define the Field

Create a new field definition in `fieldDefinitions.ts`:

```typescript
export const epicField: FieldDefinition<ShortcutEpic> = {
  id: 'epic',
  type: 'single',
  label: 'Epic',
  helperText: 'Select an epic',
  
  async fetch(api) {
    // This would need to be implemented in the API
    return api.fetchEpics();
  },
  
  getOptionLabel(epic) {
    return epic.name;
  },
  
  getOptionValue(epic) {
    return epic.id.toString();
  }
};
```

### 2. Register the Field

Add the field to the `fieldDefinitions` object in `fieldDefinitions.ts`:

```typescript
export const fieldDefinitions = {
  workflow: workflowField,
  workflowState: workflowStateField,
  owner: ownerField,
  epic: epicField, // Add your new field here
};
```

### 3. Create a Component (Optional)

Create a pre-built component in `index.ts`:

```typescript
export const EpicSelector = createFieldComponent(epicField);
```

### 4. Use the Field

Now you can use the field in your components:

```tsx
import { EpicSelector } from '../ShortcutFields';

function MyComponent() {
  const [epic, setEpic] = useState<ShortcutEpic | null>(null);
  
  return (
    <EpicSelector
      value={epic}
      onChange={setEpic}
      fullWidth
    />
  );
}
```

## Best Practices

1. **Caching**: The framework automatically caches API responses to minimize network requests.

2. **Error Handling**: Always check `field.error` in custom implementations to display error states.

3. **Loading States**: The framework manages loading states automatically, showing loading indicators when data is being fetched.

4. **Dependency Management**: When defining dependent fields, always set `dependsOn` to the ID of the parent field.

5. **Type Safety**: Use TypeScript generics to ensure type safety throughout your implementation.

6. **Component Composition**: Start with the basic components and compose them to create more complex fields rather than building from scratch.

## Example: Adding a Label Selector

Here's how you would implement a Label selector:

```typescript
// In fieldDefinitions.ts
export const labelField: FieldDefinition<ShortcutLabel> = {
  id: 'label',
  type: 'single',
  label: 'Label',
  helperText: 'Select a label',
  
  async fetch(api) {
    // Implement this method in useShortcutApi
    return api.fetchLabels();
  },
  
  getOptionLabel(label) {
    return label.name;
  },
  
  getOptionValue(label) {
    return label.id.toString();
  }
};

// Add to fieldDefinitions
export const fieldDefinitions = {
  // ... existing fields
  label: labelField,
};

// In index.ts
export const LabelSelector = createFieldComponent(labelField);

// Usage
function MyComponent() {
  const [label, setLabel] = useState<ShortcutLabel | null>(null);
  
  return (
    <LabelSelector
      value={label}
      onChange={setLabel}
    />
  );
}

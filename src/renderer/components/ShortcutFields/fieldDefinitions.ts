/**
 * Shortcut API Field Definitions
 */
import { 
  ShortcutWorkflow, 
  ShortcutWorkflowState,
  ShortcutEpicState
} from '../../types/shortcutApi';
import { FieldDefinition } from './types';

/**
 * Workflow Field Definition
 */
export const workflowField: FieldDefinition<ShortcutWorkflow> = {
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
  },
  
  // ID-based lookup methods
  getIdFromValue(workflow) {
    return workflow.id;
  },
  
  findOptionById(options, id) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return options.find(option => option.id === numericId) || null;
  }
};

/**
 * Workflow State Field Definition
 * Depends on a selected workflow
 */
export const workflowStateField: FieldDefinition<ShortcutWorkflowState, ShortcutWorkflow> = {
  id: 'workflowState',
  type: 'dependent',
  dependsOn: 'workflow',
  clearOnDependencyChange: true,
  label: 'State',
  helperText: 'Select a workflow state',
  
  async fetch(api, workflow) {
    // Handle both workflow object and direct workflow ID
    if (!workflow) {
      return [];
    }
    
    // If we have a workflow object
    if (typeof workflow === 'object' && workflow.id) {
      return api.fetchWorkflowStates(workflow.id.toString());
    }
    
    // If we have a direct workflow ID
    if (typeof workflow === 'number' || typeof workflow === 'string') {
      return api.fetchWorkflowStates(workflow.toString());
    }
    
    return [];
  },
  
  getOptionLabel(state) {
    return state.name;
  },
  
  getOptionValue(state) {
    return state.id.toString();
  },
  
  // ID-based lookup methods
  getIdFromValue(state) {
    return state.id;
  },
  
  findOptionById(options, id) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return options.find(option => option.id === numericId) || null;
  }
};

/**
 * Owner Field Definition
 * Note: This is a placeholder for future implementation
 */
export const ownerField: FieldDefinition<any> = {
  id: 'owner',
  type: 'single',
  label: 'Owner',
  helperText: 'Select an owner',
  
  async fetch(api) {
    // This would need to be implemented in the API
    // Placeholder for now
    return [];
  },
  
  getOptionLabel(owner) {
    return owner?.profile?.name || 'Unknown';
  },
  
  getOptionValue(owner) {
    return owner?.id?.toString() || '';
  },
  
  // ID-based lookup methods
  getIdFromValue(owner) {
    return owner?.id;
  },
  
  findOptionById(options, id) {
    return options.find(option => option.id?.toString() === id?.toString()) || null;
  }
};

/**
 * Epic State Field Definition
 */
export const epicStateField: FieldDefinition<ShortcutEpicState> = {
  id: 'epicState',
  type: 'single',
  label: 'Epic State',
  helperText: 'Select an epic state',
  
  async fetch(api) {
    return api.fetchEpicStates();
  },
  
  getOptionLabel(state) {
    return state.name;
  },
  
  getOptionValue(state) {
    return state.id.toString();
  },
  
  // ID-based lookup methods
  getIdFromValue(state) {
    return state.id;
  },
  
  findOptionById(options, id) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return options.find(option => option.id === numericId) || null;
  }
};

/**
 * Map of all field definitions
 */
export const fieldDefinitions = {
  workflow: workflowField,
  workflowState: workflowStateField,
  owner: ownerField,
  epicState: epicStateField,
};

/**
 * Shortcut API Field Definitions
 */
import { 
  ShortcutWorkflow, 
  ShortcutWorkflowState,
  ShortcutEpicState,
  ShortcutMember,
  ShortcutLabel,
  ShortcutEntity,
  ShortcutIteration
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
 * Member Field Definition (for owners)
 */
export const memberField: FieldDefinition<ShortcutMember> = {
  id: 'member',
  type: 'single',
  label: 'Member',
  helperText: 'Select a member',
  
  async fetch(api) {
    return api.fetchMembers();
  },
  
  getOptionLabel(member) {
    return member?.profile?.name || 'Unknown';
  },
  
  getOptionValue(member) {
    return member.id.toString();
  },
  
  // ID-based lookup methods
  getIdFromValue(member) {
    return member.id;
  },
  
  findOptionById(options, id) {
    return options.find(option => option.id.toString() === id?.toString()) || null;
  }
};

/**
 * Label Field Definition
 */
export const labelField: FieldDefinition<ShortcutLabel> = {
  id: 'label',
  type: 'single',
  label: 'Label',
  helperText: 'Select a label',
  
  async fetch(api) {
    return api.fetchLabels();
  },
  
  getOptionLabel(label) {
    return label.name;
  },
  
  getOptionValue(label) {
    return label.id.toString();
  },
  
  // ID-based lookup methods
  getIdFromValue(label) {
    return label.id;
  },
  
  findOptionById(options, id) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return options.find(option => option.id === numericId) || null;
  }
};

/**
 * Objective Field Definition
 */
export const objectiveField: FieldDefinition<any> = {
  id: 'objective',
  type: 'single',
  label: 'Objective',
  helperText: 'Select an objective',
  
  async fetch(api) {
    return api.fetchObjectives();
  },
  
  getOptionLabel(objective) {
    return objective.name;
  },
  
  getOptionValue(objective) {
    return objective.id.toString();
  },
  
  // ID-based lookup methods
  getIdFromValue(objective) {
    return objective.id;
  },
  
  findOptionById(options, id) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return options.find(option => option.id === numericId) || null;
  }
};

/**
 * Group Field Definition
 */
export const groupField: FieldDefinition<any> = {
  id: 'group',
  type: 'single',
  label: 'Team',
  helperText: 'Select a team',
  
  async fetch(api) {
    return api.fetchGroups();
  },
  
  getOptionLabel(group) {
    return group.name;
  },
  
  getOptionValue(group) {
    return group.id.toString();
  },
  
  // ID-based lookup methods
  getIdFromValue(group) {
    return group.id;
  },
  
  findOptionById(options, id) {
    return options.find(option => option.id.toString() === id?.toString()) || null;
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
 * Iteration Field Definition
 */
export const iterationField: FieldDefinition<ShortcutIteration> = {
  id: 'iteration',
  type: 'single',
  label: 'Iteration',
  helperText: 'Select an iteration',
  
  async fetch(api) {
    return api.fetchIterations ? api.fetchIterations() : [];
  },
  
  getOptionLabel(iteration) {
    return iteration.name || 'Unknown Iteration';
  },
  
  getOptionValue(iteration) {
    return iteration.id.toString();
  },
  
  // ID-based lookup methods
  getIdFromValue(iteration) {
    return iteration.id;
  },
  
  findOptionById(options, id) {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return options.find(option => option.id === numericId) || null;
  }
};

/**
 * Interface for estimate scale option
 */
interface EstimateScaleOption {
  id: number;
  value: number;
  name: string;
}

/**
 * Estimate Scale Field Definition
 */
export const estimateScaleField: FieldDefinition<EstimateScaleOption> = {
  id: 'estimateScale',
  type: 'single',
  label: 'Estimate',
  helperText: 'Select story points',
  
  async fetch(api) {
    try {
      // Fetch workspace info which contains estimate_scale
      const memberInfo = await api.fetchWorkspaceInfo();
      
      // Extract estimate scale from the response
      if (memberInfo && memberInfo.workspace2 && memberInfo.workspace2.estimate_scale && 
          Array.isArray(memberInfo.workspace2.estimate_scale) && 
          memberInfo.workspace2.estimate_scale.length > 0) {
            
        // Log the estimate scale we got from the API
        console.log('Using estimate scale from API:', memberInfo.workspace2.estimate_scale);
        
        // Convert each number to an object with id and name
        return memberInfo.workspace2.estimate_scale.map((value: number) => ({
          id: value,
          value,
          name: value.toString()
        }));
      }
      
      // If no valid estimate scale was found or it's empty, use the default
      console.log('Using default estimate scale:', DEFAULT_ESTIMATE_SCALE);
      return DEFAULT_ESTIMATE_SCALE.map(value => ({
        id: value,
        value,
        name: value.toString()
      }));
    } catch (error) {
      console.error('Error fetching estimate scale:', error);
      
      // On error, fall back to default scale
      console.log('Error occurred, using default estimate scale');
      return DEFAULT_ESTIMATE_SCALE.map(value => ({
        id: value,
        value,
        name: value.toString()
      }));
    }
  },
  
  getOptionLabel(estimate) {
    return estimate.name;
  },
  
  getOptionValue(estimate) {
    return estimate.value.toString();
  },
  
  // ID-based lookup methods
  getIdFromValue(estimate) {
    return estimate.id;
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
  member: memberField,
  label: labelField,
  objective: objectiveField,
  group: groupField,
  epicState: epicStateField,
  iteration: iterationField,
  estimateScale: estimateScaleField,
};

// Default Fibonacci sequence to use if API doesn't return estimate_scale
export const DEFAULT_ESTIMATE_SCALE = [0, 1, 2, 3, 5, 8, 13, 21];

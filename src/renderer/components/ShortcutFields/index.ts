/**
 * ShortcutFields Framework
 * A modular, reusable system for Shortcut API field selectors
 */

// Export types
export * from './types';

// Export registry
export { fieldRegistry, registerFields } from './registry';

// Export hooks
export {
  useSingleField,
  useDependentField,
  useField,
  useRegisteredField
} from './hooks';

// Export components
export {
  FieldSelector,
  DependentFieldSelector,
  createFieldComponent,
  createDependentFieldComponent
} from './components';

// Export field definitions
export {
  workflowField,
  workflowStateField,
  memberField,
  labelField,
  objectiveField,
  groupField,
  epicStateField,
  estimateScaleField,
  fieldDefinitions
} from './fieldDefinitions';

// Create and export pre-built components for common field types
import { createFieldComponent, createDependentFieldComponent } from './components';
import { 
  workflowField, 
  workflowStateField, 
  epicStateField,
  memberField,
  labelField,
  objectiveField,
  groupField,
  iterationField,
  estimateScaleField
} from './fieldDefinitions';

export const WorkflowSelector = createFieldComponent(workflowField);
export const WorkflowStateSelector = createFieldComponent(workflowStateField);
export const EpicStateSelector = createFieldComponent(epicStateField);
export const MemberSelector = createFieldComponent(memberField);
export const LabelSelector = createFieldComponent(labelField);
export const ObjectiveSelector = createFieldComponent(objectiveField);
export const GroupSelector = createFieldComponent(groupField);
export const IterationSelector = createFieldComponent(iterationField);
export const EstimateScaleSelector = createFieldComponent(estimateScaleField);
export const WorkflowAndStateSelector = createDependentFieldComponent(
  workflowField,
  workflowStateField
);

// Register field definitions by default
import { registerFields } from './registry';
import { fieldDefinitions } from './fieldDefinitions';

// Auto-register all field definitions
registerFields(Object.values(fieldDefinitions));

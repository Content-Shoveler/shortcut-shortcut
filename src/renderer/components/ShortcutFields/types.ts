/**
 * Types for Shortcut API field selection framework
 */
import { useShortcutApi } from '../../hooks/useShortcutApi';
import { ShortcutWorkflow, ShortcutWorkflowState } from '../../types/shortcutApi';

/**
 * Type for the Shortcut API interface that our fields will consume
 */
export type ShortcutApiInterface = ReturnType<typeof useShortcutApi>;

/**
 * Base field definition interface
 * Generic parameters:
 * T - The type of field value (e.g., ShortcutWorkflow)
 * D - The type of dependency value (if any)
 */
export interface FieldDefinition<T, D = void> {
  // Core identity
  id: string;
  type: 'single' | 'dependent';
  
  // Display properties
  label: string;
  placeholder?: string;
  helperText?: string;
  
  // Data fetching and processing
  fetch: (api: ShortcutApiInterface, dependency?: D | string | number) => Promise<T[]>;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  
  // ID-based selection support
  getIdFromValue?: (value: T) => string | number;
  findOptionById?: (options: T[], id: string | number) => T | null;
  
  // Validation and dependency rules
  isValid?: (value: T | null) => boolean;
  dependsOn?: string; // ID of parent field
  clearOnDependencyChange?: boolean;
}

/**
 * Props for field components
 */
export interface FieldComponentProps<T, D = void> {
  // Value can be either the full object or an ID
  value: T | null | string | number;
  onChange: (value: T | null) => void;
  dependency?: D | null | string | number;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  error?: boolean;
  errorText?: string;
}

/**
 * Field hook return type
 */
export interface FieldHookResult<T> {
  value: T | null;
  options: T[];
  loading: boolean;
  error: string | null;
  setValue: (value: T | null) => void;
  setValueById: (id: string | number) => void;
  reset: () => void;
  refresh: () => Promise<void>;
  // Add ability to track if we're resolving an ID to an object
  pending: boolean;
}

/**
 * Context for managing multiple fields
 */
export interface FieldsContextValue {
  values: Record<string, any>;
  setValue: (fieldId: string, value: any) => void;
  getFieldValue: <T>(fieldId: string) => T | null;
  getDependencyValue: <D>(fieldId: string) => D | null;
}

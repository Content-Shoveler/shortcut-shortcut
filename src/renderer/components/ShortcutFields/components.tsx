/**
 * UI Components for Shortcut field selection
 * Modernized implementation with optimized rendering
 */
import React, { useEffect, useCallback, useMemo } from 'react';
import {
  FormControl,
  MenuItem,
  Box,
  CircularProgress,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import { CyberSelect, CyberIcon } from '../cyberpunk';
import { FieldDefinition, FieldComponentProps } from './types';
import { useField, useDependentField } from './hooks';

/**
 * Single Field Selector Component
 */
export function FieldSelector<T, D = any>({
  fieldDef,
  value,
  onChange,
  dependency,
  disabled = false,
  required = false,
  fullWidth = true,
  className,
  error = false,
  errorText,
}: {
  fieldDef: FieldDefinition<T, D>;
  value: T | null | string | number;
  onChange: (value: T | null) => void;
  dependency?: D | null | string | number;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  error?: boolean;
  errorText?: string;
}) {
  // We're passing null as initialValue, we'll handle setting the value in the effect
  const field = useField(fieldDef, null, dependency, onChange);
  
  // Handle ID-based initialization and updates with valueRef to prevent loops
  const valueRef = React.useRef(value);
  
  useEffect(() => {
    // Skip if value hasn't actually changed (reference equality)
    if (value === valueRef.current) return;
    valueRef.current = value;
    
    // Now handle the value based on its type
    if (value !== null && typeof value === 'string' && fieldDef.findOptionById) {
      field.setValueById(value);
    } else if (value !== null && typeof value === 'number' && fieldDef.findOptionById) {
      field.setValueById(value);
    } else if (value !== null && typeof value === 'object') {
      field.setValue(value as T);
    } else if (value === null) {
      field.reset();
    }
  }, [value, fieldDef, field]);

  // Memoized handler for select changes to prevent unnecessary re-renders
  const handleChange = useCallback((event: SelectChangeEvent<unknown>) => {
    const selectedValue = event.target.value as string;
    
    if (!selectedValue) {
      field.setValue(null);
      return;
    }
    
    const selectedOption = field.options.find(
      option => fieldDef.getOptionValue(option).toString() === selectedValue
    );
    
    if (selectedOption) {
      field.setValue(selectedOption);
    }
  }, [field, fieldDef]);
  
  // Memoized value for the select component
  const selectValue = useMemo(() => {
    if (field.value) {
      return fieldDef.getOptionValue(field.value).toString();
    }
    return '';
  }, [field.value, fieldDef]);

  return (
    <FormControl fullWidth={fullWidth} error={error || !!field.error} className={className}>
      <CyberSelect
        label={fieldDef.label}
        value={selectValue}
        onChange={handleChange}
        disabled={disabled || field.loading || field.pending}
        required={required}
        helperText={errorText || field.error || fieldDef.helperText}
        error={error || !!field.error}
        cornerClip
      >
        {!required && (
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
        )}
        {field.loading || field.pending ? (
          <MenuItem disabled value="" style={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            {field.pending ? 'Resolving selection...' : 'Loading options...'}
          </MenuItem>
        ) : field.options.length > 0 ? (
          field.options.map(option => (
            <MenuItem
              key={fieldDef.getOptionValue(option).toString()}
              value={fieldDef.getOptionValue(option).toString()}
            >
              {fieldDef.getOptionLabel(option)}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled value="">
            No options available
          </MenuItem>
        )}
      </CyberSelect>
    </FormControl>
  );
}

/**
 * Dependent Field Selector Component
 * This component handles parent-child relationships between fields
 */
export function DependentFieldSelector<T, P>({
  parentFieldDef,
  childFieldDef,
  parentValue,
  childValue,
  onParentChange,
  onChildChange,
  disabled = false,
  required = false,
  fullWidth = true,
  className,
  parentError = false,
  childError = false,
  parentErrorText,
  childErrorText,
}: {
  parentFieldDef: FieldDefinition<P, any>;
  childFieldDef: FieldDefinition<T, P>;
  parentValue: P | null | string | number;
  childValue: T | null | string | number;
  onParentChange: (value: P | null) => void;
  onChildChange: (value: T | null) => void;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  parentError?: boolean;
  childError?: boolean;
  parentErrorText?: string;
  childErrorText?: string;
}) {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: { xs: 'column', sm: 'row' },
        width: fullWidth ? '100%' : 'auto',
      }}
      className={className}
    >
      <FieldSelector
        fieldDef={parentFieldDef}
        value={parentValue}
        onChange={onParentChange}
        disabled={disabled}
        required={required}
        fullWidth
        error={parentError}
        errorText={parentErrorText}
      />
      
      <FieldSelector
        fieldDef={childFieldDef}
        value={childValue}
        onChange={onChildChange}
        dependency={parentValue}
        disabled={disabled || !parentValue}
        required={required}
        fullWidth
        error={childError}
        errorText={childErrorText}
      />
    </Box>
  );
}

/**
 * HOC that creates a field selector component from a field definition
 * with proper memoization to prevent unnecessary re-renders
 */
export function createFieldComponent<T, D = void>(fieldDef: FieldDefinition<T, D>) {
  const FieldComponent = React.memo(({
    value,
    onChange,
    dependency,
    disabled,
    required,
    fullWidth,
    className,
    error,
    errorText,
  }: FieldComponentProps<T, D>) => {
    return (
      <FieldSelector
        fieldDef={fieldDef}
        value={value}
        onChange={onChange}
        dependency={dependency}
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        className={className}
        error={error}
        errorText={errorText}
      />
    );
  });
  
  // Set display name for debugging
  FieldComponent.displayName = `${fieldDef.id}Selector`;
  
  return FieldComponent;
}

/**
 * HOC that creates a dependent field selector component from parent/child field definitions
 * with proper memoization to prevent unnecessary re-renders
 */
export function createDependentFieldComponent<P, C>(
  parentFieldDef: FieldDefinition<P, any>,
  childFieldDef: FieldDefinition<C, P>
) {
  const DependentComponent = React.memo(({
    parentValue,
    childValue,
    onParentChange,
    onChildChange,
    disabled,
    required,
    fullWidth,
    className,
    parentError,
    childError,
    parentErrorText,
    childErrorText,
  }: {
    parentValue: P | null | string | number;
    childValue: C | null | string | number;
    onParentChange: (value: P | null) => void;
    onChildChange: (value: C | null) => void;
    disabled?: boolean;
    required?: boolean;
    fullWidth?: boolean;
    className?: string;
    parentError?: boolean;
    childError?: boolean;
    parentErrorText?: string;
    childErrorText?: string;
  }) => {
    return (
      <DependentFieldSelector
        parentFieldDef={parentFieldDef}
        childFieldDef={childFieldDef}
        parentValue={parentValue}
        childValue={childValue}
        onParentChange={onParentChange}
        onChildChange={onChildChange}
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        className={className}
        parentError={parentError}
        childError={childError}
        parentErrorText={parentErrorText}
        childErrorText={childErrorText}
      />
    );
  });
  
  // Set display name for debugging
  DependentComponent.displayName = `${parentFieldDef.id}${childFieldDef.id}Selector`;
  
  return DependentComponent;
}

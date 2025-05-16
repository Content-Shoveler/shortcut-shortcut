/**
 * Hooks for Shortcut field selection
 * Modernized implementation with proper state management and effect cleanup
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useShortcutApi } from '../../hooks/useShortcutApi';
import { FieldDefinition, FieldHookResult, ShortcutApiInterface } from './types';
import { fieldRegistry } from './registry';

/**
 * Creates a stable cache key for any value
 */
function createCacheKey(value: any): string {
  if (value === undefined || value === null) return 'null';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * Deep compare two values for equality
 */
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  
  // Handle primitive types
  if (typeof a !== 'object' || typeof b !== 'object') return a === b;
  
  // Compare arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => isEqual(val, b[idx]));
  }
  
  // Compare objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => 
    Object.prototype.hasOwnProperty.call(b, key) && isEqual(a[key], b[key])
  );
}

/**
 * Hook for managing the state of a single field
 */
export function useSingleField<T>(
  fieldDef: FieldDefinition<T, any>,
  initialValue: T | null = null,
  onChange?: (value: T | null) => void
): FieldHookResult<T> {
  // Single cohesive state object to reduce state updates
  const [state, setState] = useState<{
    value: T | null;
    options: T[];
    loading: boolean;
    error: string | null;
    pendingId: string | number | null;
    pending: boolean;
  }>({
    value: initialValue,
    options: [],
    loading: false,
    error: null,
    pendingId: null,
    pending: false
  });
  
  const shortcutApi = useShortcutApi();
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const optionsCacheRef = useRef<T[]>([]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Memoized callback to update value
  const setValue = useCallback((newValue: T | null) => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      value: newValue,
      pendingId: null,
      pending: false
    }));
    
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);
  
  // Memoized callback to set value by ID
  const setValueById = useCallback((id: string | number) => {
    if (!isMountedRef.current) return;
    
    setState(prev => {
      // Try to find in current options first
      if (prev.options.length > 0 && fieldDef.findOptionById) {
        const option = fieldDef.findOptionById(prev.options, id);
        if (option) {
          if (onChange) {
            onChange(option);
          }
          return {
            ...prev,
            value: option,
            pendingId: null,
            pending: false
          };
        }
      }
      
      // Otherwise mark as pending
      return {
        ...prev,
        pendingId: id,
        pending: true
      };
    });
  }, [fieldDef, onChange]);
  
  // Memoized callback to reset field
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      value: null,
      pendingId: null,
      pending: false
    }));
    
    if (onChange) {
      onChange(null);
    }
  }, [onChange]);
  
  // Fetch options with proper cleanup and cancellation
  const fetchOptions = useCallback(async () => {
    // Use cached results if available
    if (optionsCacheRef.current.length > 0) {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          options: optionsCacheRef.current,
          loading: false
        }));
      }
      return;
    }
    
    if (!shortcutApi.hasApiToken) {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          error: 'API token not set. Configure in Settings.',
          loading: false
        }));
      }
      return;
    }
    
    // Set loading state
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));
    }
    
    // Create request ID to handle race conditions
    const requestId = ++requestIdRef.current;
    
    try {
      const results = await fieldDef.fetch(shortcutApi);
      
      // Only update if this is still the current request and component is mounted
      if (requestId === requestIdRef.current && isMountedRef.current) {
        optionsCacheRef.current = results;
        
        setState(prev => {
          const newState = {
            ...prev,
            options: results,
            loading: false
          };
          
          // Resolve any pending ID if possible
          if (prev.pendingId && fieldDef.findOptionById) {
            const option = fieldDef.findOptionById(results, prev.pendingId);
            if (option) {
              newState.value = option;
              newState.pendingId = null;
              newState.pending = false;
              
              if (onChange) {
                onChange(option);
              }
            }
          }
          
          return newState;
        });
      }
    } catch (err) {
      // Only update error state if this is still the current request and component is mounted
      if (requestId === requestIdRef.current && isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch options';
        setState(prev => ({
          ...prev,
          error: message,
          loading: false
        }));
      }
    }
  }, [fieldDef, shortcutApi, onChange]);
  
  // Fetch options on mount or when API token changes
  const apiTokenRef = useRef(shortcutApi.hasApiToken);
  useEffect(() => {
    const apiTokenChanged = apiTokenRef.current !== shortcutApi.hasApiToken;
    apiTokenRef.current = shortcutApi.hasApiToken;
    
    if (apiTokenChanged || optionsCacheRef.current.length === 0) {
      fetchOptions();
    }
  }, [shortcutApi.hasApiToken, fetchOptions]);
  
  // Destructure state for return value
  const { value, options, loading, error, pending } = state;
  
  return {
    value,
    options,
    loading,
    error,
    setValue,
    setValueById,
    reset,
    refresh: fetchOptions,
    pending
  };
}

/**
 * Hook for managing a field that depends on another field
 */
export function useDependentField<T, D>(
  fieldDef: FieldDefinition<T, D>,
  initialValue: T | null = null,
  dependency?: D | null | string | number,
  onChange?: (value: T | null) => void
): FieldHookResult<T> {
  // Single cohesive state object to reduce state updates
  const [state, setState] = useState<{
    value: T | null;
    options: T[];
    loading: boolean;
    error: string | null;
    pendingId: string | number | null;
    pending: boolean;
  }>({
    value: initialValue,
    options: [],
    loading: false,
    error: null,
    pendingId: null,
    pending: false
  });
  
  const shortcutApi = useShortcutApi();
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const optionsCacheRef = useRef<Map<string, T[]>>(new Map());
  
  // Stable references for tracking dependency changes
  const dependencyRef = useRef(dependency);
  const dependencyCacheKeyRef = useRef(createCacheKey(dependency));
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Memoized callback to update value
  const setValue = useCallback((newValue: T | null) => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      value: newValue,
      pendingId: null,
      pending: false
    }));
    
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);
  
  // Memoized callback to set value by ID
  const setValueById = useCallback((id: string | number) => {
    if (!isMountedRef.current) return;
    
    setState(prev => {
      // Try to find in current options first
      if (prev.options.length > 0 && fieldDef.findOptionById) {
        const option = fieldDef.findOptionById(prev.options, id);
        if (option) {
          if (onChange) {
            onChange(option);
          }
          return {
            ...prev,
            value: option,
            pendingId: null,
            pending: false
          };
        }
      }
      
      // Otherwise mark as pending
      return {
        ...prev,
        pendingId: id,
        pending: true
      };
    });
  }, [fieldDef, onChange]);
  
  // Memoized callback to reset field
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      value: null,
      pendingId: null,
      pending: false
    }));
    
    if (onChange) {
      onChange(null);
    }
  }, [onChange]);
  
  // Fetch options with proper cleanup and cancellation
  const fetchOptions = useCallback(async () => {
    if (dependency === undefined || dependency === null) {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          options: [],
          loading: false
        }));
      }
      return;
    }
    
    if (!shortcutApi.hasApiToken) {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          error: 'API token not set. Configure in Settings.',
          loading: false
        }));
      }
      return;
    }
    
    const cacheKey = createCacheKey(dependency);
    
    // Use cached results if available
    if (optionsCacheRef.current.has(cacheKey)) {
      const cachedOptions = optionsCacheRef.current.get(cacheKey) || [];
      
      if (isMountedRef.current) {
        setState(prev => {
          const newState = {
            ...prev,
            options: cachedOptions,
            loading: false
          };
          
          // Resolve any pending ID if possible
          if (prev.pendingId && fieldDef.findOptionById) {
            const option = fieldDef.findOptionById(cachedOptions, prev.pendingId);
            if (option) {
              newState.value = option;
              newState.pendingId = null;
              newState.pending = false;
              
              if (onChange) {
                onChange(option);
              }
            }
          }
          
          return newState;
        });
      }
      return;
    }
    
    // Set loading state
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));
    }
    
    // Create request ID to handle race conditions
    const requestId = ++requestIdRef.current;
    
    try {
      const results = await fieldDef.fetch(shortcutApi, dependency);
      
      // Only update if this is still the current request and component is mounted
      if (requestId === requestIdRef.current && isMountedRef.current) {
        // Update cache with results
        optionsCacheRef.current.set(cacheKey, results);
        
        setState(prev => {
          const newState = {
            ...prev,
            options: results,
            loading: false
          };
          
          // Resolve any pending ID if possible
          if (prev.pendingId && fieldDef.findOptionById) {
            const option = fieldDef.findOptionById(results, prev.pendingId);
            if (option) {
              newState.value = option;
              newState.pendingId = null;
              newState.pending = false;
              
              if (onChange) {
                onChange(option);
              }
            }
          }
          
          return newState;
        });
      }
    } catch (err) {
      // Only update error state if this is still the current request and component is mounted
      if (requestId === requestIdRef.current && isMountedRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch options';
        setState(prev => ({
          ...prev,
          error: message,
          loading: false
        }));
      }
    }
  }, [fieldDef, shortcutApi, dependency, onChange]);
  
  // Handle dependency changes with debouncing
  useEffect(() => {
    if (dependency === undefined || dependency === null) {
      return;
    }
    
    // Check if dependency actually changed
    const newCacheKey = createCacheKey(dependency);
    const dependencyChanged = newCacheKey !== dependencyCacheKeyRef.current;
    
    if (dependencyChanged) {
      // Update refs
      dependencyRef.current = dependency;
      dependencyCacheKeyRef.current = newCacheKey;
      
      // Reset value if needed
      if (fieldDef.clearOnDependencyChange) {
        setValue(null);
      }
      
      // Fetch new options
      fetchOptions();
    }
  }, [dependency, fieldDef.clearOnDependencyChange, setValue, fetchOptions]);
  
  // Fetch options when API token changes
  const apiTokenRef = useRef(shortcutApi.hasApiToken);
  useEffect(() => {
    const apiTokenChanged = apiTokenRef.current !== shortcutApi.hasApiToken;
    apiTokenRef.current = shortcutApi.hasApiToken;
    
    if (apiTokenChanged && dependency !== undefined && dependency !== null) {
      fetchOptions();
    }
  }, [shortcutApi.hasApiToken, dependency, fetchOptions]);
  
  // Destructure state for return value
  const { value, options, loading, error, pending } = state;
  
  return {
    value,
    options,
    loading,
    error,
    setValue,
    setValueById,
    reset,
    refresh: fetchOptions,
    pending
  };
}

/**
 * Helper function to determine if a field is a dependent field
 */
function isDependent<T, D>(fieldDef: FieldDefinition<T, D>): boolean {
  return fieldDef.type === 'dependent' && !!fieldDef.dependsOn;
}

/**
 * Hook for creating a field hook automatically based on the field type
 */
export function useField<T, D = any>(
  fieldDef: FieldDefinition<T, D>,
  initialValue: T | null = null,
  dependency?: D | null | string | number,
  onChange?: (value: T | null) => void
): FieldHookResult<T> {
  if (isDependent(fieldDef)) {
    return useDependentField(fieldDef, initialValue, dependency, onChange);
  }
  return useSingleField(fieldDef, initialValue, onChange);
}

/**
 * Hook for creating a new field hook from a registered field definition
 */
export function useRegisteredField<T, D = any>(
  fieldId: string,
  initialValue: T | null = null,
  dependency?: D | null | string | number,
  onChange?: (value: T | null) => void
): FieldHookResult<T> {
  const fieldDef = useMemo(() => {
    const def = fieldRegistry.get(fieldId);
    if (!def) {
      throw new Error(`Field definition with ID '${fieldId}' not found in registry.`);
    }
    return def;
  }, [fieldId]);
  
  return useField(fieldDef as FieldDefinition<T, D>, initialValue, dependency, onChange);
}

/**
 * Hooks for Shortcut field selection
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useShortcutApi } from '../../hooks/useShortcutApi';
import { FieldDefinition, FieldHookResult, ShortcutApiInterface } from './types';
import { fieldRegistry } from './registry';

/**
 * Hook for managing the state of a single field
 */
export function useSingleField<T>(
  fieldDef: FieldDefinition<T, any>,
  initialValue: T | null = null,
  onChange?: (value: T | null) => void
): FieldHookResult<T> {
  const shortcutApi = useShortcutApi();
  const [value, setValueInternal] = useState<T | null>(initialValue);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [pending, setPending] = useState(false);
  const requestIdRef = useRef(0);
  
  // Cache of fetched options to reduce API calls
  const optionsCache = useRef<T[]>([]);
  
  // Callback to set value and notify parent
  const setValue = useCallback((newValue: T | null) => {
    setValueInternal(newValue);
    setPendingId(null); // Clear any pending ID resolution
    setPending(false);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  // Set value by ID
  const setValueById = useCallback((id: string | number) => {
    // If we already have options loaded, try to find a match immediately
    if (options.length > 0 && fieldDef.findOptionById) {
      const option = fieldDef.findOptionById(options, id);
      if (option) {
        setValue(option);
        return;
      }
    }
    
    // Otherwise, store the ID and mark as pending
    setPendingId(id);
    setPending(true);
    
    // If no options are loaded yet, this will be resolved when options load
    // If options are already loaded but no match was found, we'll keep the pending state
  }, [options, fieldDef, setValue]);

  // Reset the field value
  const reset = useCallback(() => {
    setValue(null);
    setPendingId(null);
    setPending(false);
  }, [setValue]);

  // Fetch options from API with caching
  const fetchOptions = useCallback(async () => {
    // Return cached results if available
    if (optionsCache.current.length > 0) {
      setOptions(optionsCache.current);
      return;
    }

    if (!shortcutApi.hasApiToken) {
      setError('API token not set. Configure in Settings.');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Generate a unique request ID to prevent race conditions
    const requestId = ++requestIdRef.current;
    
    try {
      const results = await fieldDef.fetch(shortcutApi);
      
      // Only update state if this is the most recent request
      if (requestId === requestIdRef.current) {
        setOptions(results);
        optionsCache.current = results;
        setLoading(false);
      }
    } catch (err) {
      // Only update error state if this is the most recent request
      if (requestId === requestIdRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch options';
        setError(message);
        setLoading(false);
      }
    }
  }, [shortcutApi, fieldDef]);

  // Fetch options when component mounts or API token changes
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions, shortcutApi.hasApiToken]);

  // Resolve pendingId to actual object when options are available
  useEffect(() => {
    if (pendingId && options.length > 0 && fieldDef.findOptionById) {
      const option = fieldDef.findOptionById(options, pendingId);
      if (option) {
        setValue(option);
      }
    }
  }, [pendingId, options, fieldDef, setValue]);

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
  const shortcutApi = useShortcutApi();
  const [value, setValueInternal] = useState<T | null>(initialValue);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [pending, setPending] = useState(false);
  const requestIdRef = useRef(0);
  
  // Store previous dependency to detect changes - using any type to accommodate all possible types
  const prevDependencyRef = useRef<any>(dependency);
  
  // Cache keyed by dependency value
  const optionsCache = useRef<Map<string, T[]>>(new Map());
  
  // Callback to set value and notify parent
  const setValue = useCallback((newValue: T | null) => {
    setValueInternal(newValue);
    setPendingId(null); // Clear any pending ID resolution
    setPending(false);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  // Set value by ID
  const setValueById = useCallback((id: string | number) => {
    // If we already have options loaded, try to find a match immediately
    if (options.length > 0 && fieldDef.findOptionById) {
      const option = fieldDef.findOptionById(options, id);
      if (option) {
        setValue(option);
        return;
      }
    }
    
    // Otherwise, store the ID and mark as pending
    setPendingId(id);
    setPending(true);
    
    // If no options are loaded yet, this will be resolved when options load
    // If options are already loaded but no match was found, we'll keep the pending state
  }, [options, fieldDef, setValue]);

  // Reset field value
  const reset = useCallback(() => {
    setValue(null);
    setPendingId(null);
    setPending(false);
  }, [setValue]);

  // Create a cache key for the dependency value
  const getDependencyCacheKey = useCallback((dep?: any): string => {
    if (dep === undefined || dep === null) return 'null';
    if (typeof dep === 'object') {
      try {
        return JSON.stringify(dep);
      } catch {
        return String(dep);
      }
    }
    return String(dep);
  }, []);

  // Fetch options based on dependency
  const fetchOptions = useCallback(async () => {
    // Skip if there's no dependency
    if (dependency === undefined || dependency === null) {
      setOptions([]);
      return;
    }
    
    // Ensure we have a valid dependency - can be an object, string ID, or number ID
    const validDependency = dependency;

    if (!shortcutApi.hasApiToken) {
      setError('API token not set. Configure in Settings.');
      return;
    }

    const cacheKey = getDependencyCacheKey(dependency);
    
    // Return cached results if available
    if (optionsCache.current.has(cacheKey)) {
      setOptions(optionsCache.current.get(cacheKey) || []);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Generate a unique request ID to prevent race conditions
    const requestId = ++requestIdRef.current;
    
    try {
      const results = await fieldDef.fetch(shortcutApi, dependency);
      
      // Only update state if this is the most recent request
      if (requestId === requestIdRef.current) {
        setOptions(results);
        optionsCache.current.set(cacheKey, results);
        setLoading(false);
      }
    } catch (err) {
      // Only update error state if this is the most recent request
      if (requestId === requestIdRef.current) {
        const message = err instanceof Error ? err.message : 'Failed to fetch options';
        setError(message);
        setLoading(false);
      }
    }
  }, [shortcutApi, fieldDef, dependency, getDependencyCacheKey]);

  // Fetch options when component mounts, API token changes, or dependency changes
  // Using a dependency ref to avoid infinite loops but still detect changes
  const dependencyRef = useRef(dependency);
  useEffect(() => {
    // Always fetch on initial mount
    if (dependency !== undefined && dependency !== null) {
      fetchOptions();
      dependencyRef.current = dependency;
    }
  }, [fetchOptions, shortcutApi.hasApiToken]); // Removed dependency to prevent infinite loop
  
  // Extra effect to detect actual dependency changes
  useEffect(() => {
    if (dependency === undefined || dependency === null) {
      return;
    }
    
    // Only refetch if the dependency actually changed in a meaningful way
    const prevDep = dependencyRef.current;
    const currDep = dependency;
    
    // Skip initial setup when they're both the same value
    if (prevDep === currDep) {
      return;
    }
    
    // Convert to strings for comparison (avoids reference comparison issues)
    const prevDepStr = prevDep ? (typeof prevDep === 'object' ? JSON.stringify(prevDep) : String(prevDep)) : 'null';
    const currDepStr = currDep ? (typeof currDep === 'object' ? JSON.stringify(currDep) : String(currDep)) : 'null';
    
    if (prevDepStr !== currDepStr) {
      dependencyRef.current = dependency;
      fetchOptions();
    }
  }, [dependency, fetchOptions]);

  // Reset value when dependency changes if specified in field definition
  useEffect(() => {
    const dependencyChanged = prevDependencyRef.current !== dependency;
    prevDependencyRef.current = dependency;
    
    if (dependencyChanged && fieldDef.clearOnDependencyChange) {
      setValue(null);
      setPendingId(null);
      setPending(false);
    }
  }, [dependency, fieldDef.clearOnDependencyChange, setValue]);

  // Resolve pendingId to actual object when options are available
  useEffect(() => {
    if (pendingId && options.length > 0 && fieldDef.findOptionById) {
      const option = fieldDef.findOptionById(options, pendingId);
      if (option) {
        setValue(option);
      }
    }
  }, [pendingId, options, fieldDef, setValue]);

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

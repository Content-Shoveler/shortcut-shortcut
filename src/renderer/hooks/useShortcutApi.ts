/**
 * React hook for accessing Shortcut API functions with caching
 */
import { useCallback, useState, useEffect, useRef } from 'react';
import { useSettings } from '../store/SettingsContext';
import { useCache } from '../store/CacheContext';
import {
  ShortcutProject,
  ShortcutWorkflow,
  ShortcutWorkflowState,
} from '../types/shortcutApi';
import { ShortcutApiResponse } from '../utils/shortcutApiClient';
import * as shortcutApi from '../utils/shortcutApiClient';
import { API_TOKEN_STORAGE_KEY } from '../utils/shortcutApiClient';

/**
 * Custom hook that provides access to Shortcut API functions
 * with automatic API token handling
 * 
 * Utility function to create a consistent cache key
 */
const createCacheKey = (endpoint: string, apiToken: string, params?: any): string => {
  // Include apiToken (or a hash of it) to avoid cache collisions between accounts
  // Just use the first 8 chars of token to avoid storing full token in memory
  const tokenPart = apiToken.substring(0, 8);
  
  // If we have additional params, add them to the key
  const paramsStr = params ? `-${JSON.stringify(params)}` : '';
  
  return `shortcut-api-${endpoint}${paramsStr}-${tokenPart}`;
};

export function useShortcutApi() {
  const { settings, updateApiToken } = useSettings();
  const { getCache, setCache, invalidateCache } = useCache();
  
  // Get the API token from settings context
  const apiToken = settings.apiToken || '';
  
  // State to track if token has been validated - initialize based on token existence
  const [tokenValidated, setTokenValidated] = useState<boolean | null>(() => {
    // If there's no token, we know it's false right away
    if (!apiToken) {
      return false;
    }
    // Otherwise, we'll validate in useEffect
    return null;
  });

  // Prevent multiple validation calls for the same token
  const lastValidatedToken = useRef<string>('');
  
  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);
  // Use this to debounce validation calls
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Debug logging for token tracking
  useEffect(() => {
    console.log('Current API token in useShortcutApi:', apiToken ? 'exists' : 'empty');
    console.log('Client API token:', shortcutApi.getApiToken() ? 'exists' : 'empty');
    console.log('localStorage token:', localStorage.getItem(API_TOKEN_STORAGE_KEY) ? 'exists' : 'empty');
  }, [apiToken]);

  // When the API token changes, update it in the API client
  useEffect(() => {
    // Get existing tokens from all sources
    const currentClientToken = shortcutApi.getApiToken();
    const currentStorageToken = localStorage.getItem(API_TOKEN_STORAGE_KEY);
    
    // Priority: settings token > localStorage token > no token
    if (apiToken) {
      // Settings token exists, make sure client has it
      if (currentClientToken !== apiToken) {
        console.log('Updating API token in shortcutApiClient from settings', apiToken ? '[exists]' : '[empty]');
        shortcutApi.setApiToken(apiToken);
      }
    } else if (currentStorageToken) {
      // No settings token but localStorage has one - use that
      console.log('Using persisted API token from localStorage');
      updateApiToken(currentStorageToken);
    } else if (currentClientToken) {
      // No settings or localStorage token but client has one - sync it back
      console.log('Syncing API token from client to settings');
      updateApiToken(currentClientToken);
    } else {
      console.log('No API token available in any storage location');
    }
  }, [apiToken, updateApiToken]);
  
  // On first mount, validate the token if it exists - but only once
  useEffect(() => {
    const validateOnMount = async () => {
      // If we have a token but haven't validated it yet
      if (apiToken && tokenValidated === null && lastValidatedToken.current !== apiToken) {
        lastValidatedToken.current = apiToken;
        const valid = await validateApiToken();
        if (isMounted.current) {
          setTokenValidated(valid);
        }
      }
    };
    
    validateOnMount();
  }, []); // Run only on mount

  // Check token validity when token changes - with debouncing
  useEffect(() => {
    
    // Skip validation if this token has already been validated
    if (apiToken === lastValidatedToken.current) {
      return;
    }
    
    const checkToken = async () => {
      
      // Clear any existing timeout to prevent stale validations
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      
      // Set a small delay to prevent rapid consecutive validations
      validationTimeoutRef.current = setTimeout(async () => {
        if (apiToken) {
          // Update last validated token before validation to prevent loops
          lastValidatedToken.current = apiToken;
          
          const isValid = await validateApiToken();
          
          if (isMounted.current) {
            setTokenValidated(isValid);
          }
        } else {
          lastValidatedToken.current = '';
          
          if (isMounted.current) {
            setTokenValidated(false);
          }
        }
        
        validationTimeoutRef.current = null;
      }, 300); // 300ms debounce
    };
    
    checkToken();
    
    // Clean up timeout on unmount or when apiToken changes
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [apiToken]);

  /**
   * Validate if the current API token is valid
   */
  const validateApiToken = useCallback(async (): Promise<boolean> => {
    if (!apiToken) {
      return false;
    }
    
    try {
      const response = await shortcutApi.validateToken(apiToken);
      setTokenValidated(response.success);
      return response.success;
    } catch (error) {
      setTokenValidated(false);
      return false;
    }
  }, [apiToken]);

  /**
   * Fetch all projects from Shortcut
   */
  const fetchProjects = useCallback(async (): Promise<ShortcutProject[]> => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('projects', apiToken);
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached projects data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    const response = await shortcutApi.fetchProjects();
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch projects');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || []);
    
    return response.data || [];
  }, [apiToken, getCache, setCache]);

  /**
   * Fetch all workflows from Shortcut
   */
  const fetchWorkflows = useCallback(async (): Promise<ShortcutWorkflow[]> => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('workflows', apiToken);
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached workflows data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    const response = await shortcutApi.fetchWorkflows();
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workflows');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || []);
    
    return response.data || [];
  }, [apiToken, getCache, setCache]);

  /**
   * Fetch workflow states for a specific workflow
   */
  const fetchWorkflowStates = useCallback(
    async (workflowId: string | number): Promise<ShortcutWorkflowState[]> => {
      if (!apiToken) {
        throw new Error('API token is not set');
      }
      
      // Create a cache key for this API call
      const cacheKey = createCacheKey('workflow-states', apiToken, { workflowId });
      
      // Check if we have a valid cache entry
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        console.log(`Using cached workflow states for workflow ${workflowId}`);
        return cachedData;
      }
      
      // If no cache hit, fetch from API
      const response = await shortcutApi.fetchWorkflowStates(workflowId.toString());
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch workflow states');
      }
      
      // Store successful response in cache
      setCache(cacheKey, response.data || []);
      
      return response.data || [];
    },
    [apiToken, getCache, setCache]
  );

  /**
   * Fetch epic workflow containing all epic states from Shortcut
   */
  const fetchEpicWorkflow = useCallback(async (epicId: string) => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('epic-workflow', apiToken, { epicId });
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached epic workflow data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    const response = await shortcutApi.fetchEpicWorkflow(epicId);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch epic workflow');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || null);
    
    return response.data || null;
  }, [apiToken, getCache, setCache]);

  /**
   * Fetch epic states from Shortcut
   */
  const fetchEpicStates = useCallback(async (epicId: string) => {
    try {
      const workflow = await fetchEpicWorkflow(epicId);
      return workflow.epic_states || [];
    } catch (error) {
      console.error('Failed to fetch epic states:', error);
      return [];
    }
  }, [fetchEpicWorkflow]);

  /**
   * Create multiple stories at once using the bulk API
   */
  const createMultipleStories = useCallback(async (storiesData: any[]): Promise<any[]> => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    const response = await shortcutApi.createMultipleStories(storiesData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create multiple stories');
    }
    
    // After creating stories, invalidate related caches
    invalidateCache('stories');
    
    return response.data || [];
  }, [apiToken, invalidateCache]);

  /**
   * Create an epic with associated stories
   */
  const createEpicWithStories = useCallback(
    async (
      epicData: {
        name: string;
        description: string;
        state: string;
        [key: string]: any; // Allow any additional fields from the template
      },
      workflowId: string,
      stories: Array<{
        name: string;
        description: string;
        type: string;
        state: string;
        workflow_state_id?: string;
        estimate?: number;
        labels?: string[];
        owner_ids?: string[];
        iteration_id?: number;
      }>
    ): Promise<{ epicId: string; storyIds: string[] }> => {
      if (!apiToken) {
        throw new Error('API token is not set');
      }
      
      // 1. Create the epic with all fields from epicData
      // Create a comprehensive payload that includes all valid fields
      const epicPayload: Record<string, any> = {
        // Include the basic required fields
        name: epicData.name,
        description: epicData.description,
        
        // Include additional fields if they exist in the template
        ...(epicData.epic_state_id && { epic_state_id: epicData.epic_state_id }),
        // Only include state if epic_state_id is not provided (avoid conflict)
        ...(!epicData.epic_state_id && { state: epicData.state }),
        ...(epicData.deadline && { deadline: epicData.deadline }),
        ...(epicData.planned_start_date && { planned_start_date: epicData.planned_start_date }),
        
        // Handle arrays properly
        ...(epicData.objective_ids && { objective_ids: epicData.objective_ids }),
        ...(epicData.owner_ids && { owner_ids: epicData.owner_ids })
        
        // Remove all label-related properties
      };
      
      console.log('Full epic payload being sent:', epicPayload);
      
      const epicResponse = await shortcutApi.createEpic(epicPayload);
      if (!epicResponse.success) {
        throw new Error(epicResponse.message || 'Failed to create epic');
      }
      
      // After creating an epic, invalidate related caches
      invalidateCache('epics');
      
      const epic = epicResponse.data;
      
      // 2. Create stories in bulk
      
      // Only fetch workflow states if any stories need them
      let workflowStates: any[] = [];
      const needWorkflowStates = stories.some(story => !story.workflow_state_id);
      
      if (needWorkflowStates) {
        const statesResponse = await shortcutApi.fetchWorkflowStates(workflowId);
        
        if (!statesResponse.success) {
          throw new Error(statesResponse.message || 'Failed to fetch workflow states');
        }
        
        workflowStates = statesResponse.data || [];
      }
      
      // Prepare all story payloads
      const storyPayloads = stories.map(storyData => {
        // Use the provided workflow_state_id if available
        let workflowStateId = storyData.workflow_state_id;
        
        // If not available, look up by name
        if (!workflowStateId && workflowStates.length > 0) {
          const state = workflowStates.find((s: any) => s.name === storyData.state);
          if (!state) {
            console.warn(`State "${storyData.state}" not found in workflow. Using first available state.`);
          }
          workflowStateId = state?.id || workflowStates[0]?.id;
        }
        
        if (!workflowStateId) {
          throw new Error(`Cannot determine workflow state ID for story: ${storyData.name}`);
        }
        
        // Create a universal payload that passes through all original fields
        // and only transforms or adds what's needed
        return {
          // Pass through ALL original properties 
          ...storyData,
          
          // Override fields that need transformation for the API
          story_type: storyData.type,
          workflow_state_id: workflowStateId,
          
          // Add computed fields
          epic_id: epic.id,
          
          // Remove fields that shouldn't be sent to the API
          type: undefined,
          state: undefined
        };
      });
      
      // Create all stories in one API call
      const storiesResponse = await shortcutApi.createMultipleStories(storyPayloads);
      if (!storiesResponse.success) {
        throw new Error(storiesResponse.message || 'Failed to create stories');
      }
      
      // After creating stories, invalidate related caches
      invalidateCache('stories');
      
      // Extract the IDs from the response
      const storyIds = storiesResponse.data.map((story: any) => story.id.toString());
      
      return {
        epicId: epic.id.toString(),
        storyIds
      };
    },
    [apiToken, invalidateCache]
  );

  // Simplify the hasApiToken calculation to ensure it works correctly
  const hasApiToken = !!apiToken && tokenValidated === true;
  
  /**
   * Fetch all members from Shortcut
   */
  const fetchMembers = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('members', apiToken);
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached members data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    const response = await shortcutApi.fetchMembers();
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch members');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || []);
    
    return response.data || [];
  }, [apiToken, getCache, setCache]);

  /**
   * Fetch all labels from Shortcut
   */
  const fetchLabels = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('labels', apiToken);
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached labels data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    const response = await shortcutApi.fetchLabels();
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch labels');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || []);
    
    return response.data || [];
  }, [apiToken, getCache, setCache]);

  /**
   * Fetch all objectives from Shortcut
   */
  const fetchObjectives = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('objectives', apiToken);
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached objectives data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    const response = await shortcutApi.fetchObjectives();
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch objectives');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || []);
    
    return response.data || [];
  }, [apiToken, getCache, setCache]);

  /**
   * Fetch all groups (teams) from Shortcut
   */
  const fetchGroups = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('groups', apiToken);
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached groups data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    const response = await shortcutApi.fetchGroups();
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch groups');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || []);
    
    return response.data || [];
  }, [apiToken, getCache, setCache]);

  /**
   * Fetch all iterations from Shortcut
   * @param params Optional parameters for web app compatibility
   */
  const fetchIterations = useCallback(async (params: any = {}) => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('iterations', apiToken);
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached iterations data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    // Pass empty params object for web app compatibility
    const response = await shortcutApi.fetchIterations(params);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch iterations');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || []);
    
    return response.data || [];
  }, [apiToken, getCache, setCache]);

  /**
   * Fetch workspace info containing estimate scale from Shortcut
   */
  const fetchWorkspaceInfo = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    // Create a cache key for this API call
    const cacheKey = createCacheKey('workspace-info', apiToken);
    
    // Check if we have a valid cache entry
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Using cached workspace info data');
      return cachedData;
    }
    
    // If no cache hit, fetch from API
    const response = await shortcutApi.fetchWorkspaceInfo();
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workspace info');
    }
    
    // Store successful response in cache
    setCache(cacheKey, response.data || null);
    
    return response.data || null;
  }, [apiToken, getCache, setCache]);

  return {
    // Check if we have a valid token set
    hasApiToken,
    // Token validation state
    tokenValidated,
    // API functions
    validateApiToken,
    fetchProjects,
    fetchWorkflows,
    fetchWorkflowStates,
    fetchEpicWorkflow,
    fetchEpicStates,
    fetchMembers,
    fetchLabels,
    fetchObjectives,
    fetchGroups,
    fetchIterations,
    fetchWorkspaceInfo,
    createMultipleStories,
    createEpicWithStories,
  };
}

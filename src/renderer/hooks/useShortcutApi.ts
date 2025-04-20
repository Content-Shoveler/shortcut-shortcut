/**
 * React hook for accessing Shortcut API functions
 */
import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useSettings } from '../store/SettingsContext';
import {
  ShortcutProject,
  ShortcutWorkflow,
  ShortcutWorkflowState,
} from '../types/shortcutApi';
import { ShortcutApiResponse } from '../types/electron';

// Define a type that includes the shortcutApi property for TypeScript
type ShortcutElectronAPI = {
  shortcutApi: {
    validateToken: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchProjects: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchWorkflows: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchWorkflowStates: (apiToken: string, workflowId: string) => Promise<ShortcutApiResponse>;
    fetchEpicWorkflow: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchMembers: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchLabels: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchObjectives: (apiToken: string) => Promise<ShortcutApiResponse>;
    fetchIterations: (apiToken: string) => Promise<ShortcutApiResponse>;
    createEpic: (apiToken: string, epicData: any) => Promise<ShortcutApiResponse>;
    createStory: (apiToken: string, storyData: any) => Promise<ShortcutApiResponse>;
    createMultipleStories: (apiToken: string, storiesData: any[]) => Promise<ShortcutApiResponse>;
  };
  // Include other properties from ElectronAPI
  getTemplates: () => Promise<any[]>;
  saveTemplate: (template: any) => Promise<any>;
  deleteTemplate: (templateId: string) => Promise<string>;
  exportTemplates: () => Promise<boolean>;
  importTemplates: () => Promise<any[] | null>;
};

/**
 * Custom hook that provides access to Shortcut API functions
 * with automatic API token handling
 */
export function useShortcutApi() {
  const { settings } = useSettings();
  
  // Get the API token from context or fallback to localStorage if context failed to load it
  const getTokenWithFallback = () => {
    // First try to get from context
    if (settings.apiToken) {
      return settings.apiToken;
    }
    
    // Fallback to localStorage if context doesn't have it
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.apiToken) {
          return parsed.apiToken;
        }
      }
    } catch (error) {
      // Error reading from localStorage
    }
    
    return '';
  };
  
  const apiToken = getTokenWithFallback();
  
  
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
      const api = window.electronAPI as ShortcutElectronAPI;
      const response = await api.shortcutApi.validateToken(apiToken);
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
    
    const api = window.electronAPI as ShortcutElectronAPI;
    const response = await api.shortcutApi.fetchProjects(apiToken);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch projects');
    }
    
    return response.data || [];
  }, [apiToken]);

  /**
   * Fetch all workflows from Shortcut
   */
  const fetchWorkflows = useCallback(async (): Promise<ShortcutWorkflow[]> => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    const api = window.electronAPI as ShortcutElectronAPI;
    const response = await api.shortcutApi.fetchWorkflows(apiToken);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workflows');
    }
    
    return response.data || [];
  }, [apiToken]);

  /**
   * Fetch workflow states for a specific workflow
   */
  const fetchWorkflowStates = useCallback(
    async (workflowId: string | number): Promise<ShortcutWorkflowState[]> => {
      if (!apiToken) {
        throw new Error('API token is not set');
      }
      
      const api = window.electronAPI as ShortcutElectronAPI;
      const response = await api.shortcutApi.fetchWorkflowStates(
        apiToken, 
        workflowId.toString()
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch workflow states');
      }
      
      return response.data || [];
    },
    [apiToken]
  );

  /**
   * Fetch epic workflow containing all epic states from Shortcut
   */
  const fetchEpicWorkflow = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    const api = window.electronAPI as ShortcutElectronAPI;
    const response = await api.shortcutApi.fetchEpicWorkflow(apiToken);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch epic workflow');
    }
    
    return response.data || null;
  }, [apiToken]);

  /**
   * Fetch epic states from Shortcut
   */
  const fetchEpicStates = useCallback(async () => {
    try {
      const workflow = await fetchEpicWorkflow();
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
    
    const api = window.electronAPI as ShortcutElectronAPI;
    const response = await api.shortcutApi.createMultipleStories(apiToken, storiesData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create multiple stories');
    }
    
    return response.data || [];
  }, [apiToken]);

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
      
      const api = window.electronAPI as ShortcutElectronAPI;
      const epicResponse = await api.shortcutApi.createEpic(apiToken, epicPayload);
      if (!epicResponse.success) {
        throw new Error(epicResponse.message || 'Failed to create epic');
      }
      
      const epic = epicResponse.data;
      
      // 2. Create stories in bulk
      
      // Only fetch workflow states if any stories need them
      let workflowStates: any[] = [];
      const needWorkflowStates = stories.some(story => !story.workflow_state_id);
      
      if (needWorkflowStates) {
        const statesResponse = await api.shortcutApi.fetchWorkflowStates(
          apiToken, 
          workflowId
        );
        
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
      const storiesResponse = await api.shortcutApi.createMultipleStories(apiToken, storyPayloads);
      if (!storiesResponse.success) {
        throw new Error(storiesResponse.message || 'Failed to create stories');
      }
      
      // Extract the IDs from the response
      const storyIds = storiesResponse.data.map((story: any) => story.id.toString());
      
      return {
        epicId: epic.id.toString(),
        storyIds
      };
    },
    [apiToken]
  );

  // Explicitly calculate and log hasApiToken to debug
  
  // Simplify the hasApiToken calculation to ensure it works correctly
  // We're removing the memoization temporarily to make sure it's not causing issues
  const hasApiToken = !!apiToken && tokenValidated === true;
  
  /**
   * Fetch all members from Shortcut
   */
  const fetchMembers = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    const api = window.electronAPI as ShortcutElectronAPI;
    const response = await api.shortcutApi.fetchMembers(apiToken);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch members');
    }
    
    return response.data || [];
  }, [apiToken]);

  /**
   * Fetch all labels from Shortcut
   */
  const fetchLabels = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    const api = window.electronAPI as ShortcutElectronAPI;
    const response = await api.shortcutApi.fetchLabels(apiToken);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch labels');
    }
    
    return response.data || [];
  }, [apiToken]);

  /**
   * Fetch all objectives from Shortcut
   */
  const fetchObjectives = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    const api = window.electronAPI as ShortcutElectronAPI;
    const response = await api.shortcutApi.fetchObjectives(apiToken);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch objectives');
    }
    
    return response.data || [];
  }, [apiToken]);

  /**
   * Fetch all iterations from Shortcut
   */
  const fetchIterations = useCallback(async () => {
    if (!apiToken) {
      throw new Error('API token is not set');
    }
    
    const api = window.electronAPI as ShortcutElectronAPI;
    const response = await api.shortcutApi.fetchIterations(apiToken);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch iterations');
    }
    
    return response.data || [];
  }, [apiToken]);

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
    fetchIterations,
    createMultipleStories,
    createEpicWithStories,
  };
}

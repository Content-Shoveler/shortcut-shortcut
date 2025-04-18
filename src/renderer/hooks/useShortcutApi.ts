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
    createEpic: (apiToken: string, epicData: any) => Promise<ShortcutApiResponse>;
    createStory: (apiToken: string, storyData: any) => Promise<ShortcutApiResponse>;
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
   * Create an epic with associated stories
   */
  const createEpicWithStories = useCallback(
    async (
      epicData: {
        name: string;
        description: string;
        state: string;
        projectId: string;
        workflowId: string;
      },
      stories: Array<{
        name: string;
        description: string;
        type: string;
        state: string;
        estimate?: number;
        labels?: string[];
      }>
    ): Promise<{ epicId: string; storyIds: string[] }> => {
      if (!apiToken) {
        throw new Error('API token is not set');
      }
      
      // 1. Create the epic
      const epicPayload = {
        name: epicData.name,
        description: epicData.description,
        project_ids: [epicData.projectId],
        labels: []
      };
      
      const api = window.electronAPI as ShortcutElectronAPI;
      const epicResponse = await api.shortcutApi.createEpic(apiToken, epicPayload);
      if (!epicResponse.success) {
        throw new Error(epicResponse.message || 'Failed to create epic');
      }
      
      const epic = epicResponse.data;
      
      // 2. Get workflow states
      const statesResponse = await api.shortcutApi.fetchWorkflowStates(
        apiToken, 
        epicData.workflowId
      );
      
      if (!statesResponse.success) {
        throw new Error(statesResponse.message || 'Failed to fetch workflow states');
      }
      
      const workflowStates = statesResponse.data || [];
      
      // 3. Create stories
      const storyIds: string[] = [];
      
      for (const storyData of stories) {
        // Find workflow state ID that matches the state name
        const state = workflowStates.find((s: any) => s.name === storyData.state);
        if (!state) {
          console.warn(`State "${storyData.state}" not found in workflow. Using first available state.`);
        }
        
        const workflowStateId = state?.id || workflowStates[0]?.id;
        
        const storyPayload = {
          name: storyData.name,
          description: storyData.description,
          story_type: storyData.type,
          workflow_state_id: workflowStateId,
          epic_id: epic.id,
          project_id: epicData.projectId,
          estimate: storyData.estimate,
          labels: storyData.labels?.map(label => ({ name: label }))
        };
        
        const storyResponse = await api.shortcutApi.createStory(apiToken, storyPayload);
        if (!storyResponse.success) {
          throw new Error(storyResponse.message || 'Failed to create story');
        }
        
        storyIds.push(storyResponse.data.id.toString());
      }
      
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
    createEpicWithStories,
  };
}

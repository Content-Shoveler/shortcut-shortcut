import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { createShortcutApiService } from '../services/api/ShortcutApiService';
import { settingsStorage, AppSettings, defaultSettings } from '../services/storage/SettingsStorage';

// Define the context type
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateApiToken: (token: string) => void;
  validateApiToken: (token: string) => Promise<boolean>;
  isLoading: boolean;
  operationState: {
    operation: string | null;
    isProcessing: boolean;
    error: Error | null;
  };
}

// Create context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  updateApiToken: () => {},
  validateApiToken: async () => false,
  isLoading: true,
  operationState: {
    operation: null,
    isProcessing: false,
    error: null
  }
});

// Custom hook for using the settings context
export const useSettings = () => useContext(SettingsContext);

// Settings provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // State for settings and loading status
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add operation state tracking
  const [operationState, setOperationState] = useState<{
    operation: string | null;
    isProcessing: boolean;
    error: Error | null;
  }>({
    operation: null,
    isProcessing: false,
    error: null
  });

  // Initialize settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await settingsStorage.getSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    // Track the operation
    setOperationState({
      operation: 'updateSettings',
      isProcessing: true,
      error: null
    });

    // Update local state immediately for responsive UI
    setSettings(prevSettings => {
      // Create a shallow copy of the settings and merge with the new settings
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
        // Handle nested objects specially
        ...(newSettings.confirmDialogs && {
          confirmDialogs: {
            ...prevSettings.confirmDialogs,
            ...newSettings.confirmDialogs,
          }
        }),
        ...(newSettings.appearance && {
          appearance: {
            ...prevSettings.appearance,
            ...newSettings.appearance,
          }
        }),
      };
      
      // Update persistent storage with proper feedback
      settingsStorage.updateSettings(updatedSettings)
        .then(() => {
          setOperationState({
            operation: 'updateSettings',
            isProcessing: false, 
            error: null
          });
          console.log('Settings updated successfully in storage');
        })
        .catch(error => {
          console.error('Failed to update settings in storage:', error);
          setOperationState({
            operation: 'updateSettings',
            isProcessing: false,
            error
          });
          // Could add toast notification here
        });
      
      return updatedSettings;
    });
  }, []);
  
  // Update API token
  const updateApiToken = useCallback((token: string) => {
    // Update local state immediately
    setSettings(prevSettings => ({
      ...prevSettings,
      apiToken: token,
    }));
    
    // Update persistent storage asynchronously
    settingsStorage.updateApiToken(token)
      .catch(error => console.error('Failed to update API token in storage:', error));
  }, []);
  
  // Validate API token using the appropriate API service
  const validateApiToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const apiService = createShortcutApiService();
      return await apiService.validateToken(token);
    } catch (error) {
      console.error('Error validating API token:', error);
      return false;
    }
  }, []);
  
  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateApiToken,
        validateApiToken,
        isLoading,
        operationState // Add this to the context value
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

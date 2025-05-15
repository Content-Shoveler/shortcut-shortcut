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
}

// Create context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  updateApiToken: () => {},
  validateApiToken: async () => false,
  isLoading: true,
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
      
      // Update persistent storage asynchronously
      settingsStorage.updateSettings(updatedSettings)
        .catch(error => console.error('Failed to update settings in storage:', error));
      
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

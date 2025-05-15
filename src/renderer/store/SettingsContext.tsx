import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ShortcutApiResponse } from '../utils/shortcutApiClient';
import * as shortcutApi from '../utils/shortcutApiClient';
import { API_TOKEN_STORAGE_KEY } from '../utils/shortcutApiClient';
import { AppSettings as DexieAppSettings, getSetting, saveSetting } from '../services/dexieService';

// Define the settings structure
interface AppSettings extends DexieAppSettings {
  startupPage: 'home' | 'last-viewed';
  confirmDialogs: {
    deleteTemplate: boolean;
    applyTemplate: boolean;
  };
  appearance: {
    density: 'comfortable' | 'compact';
    fontSize: 'small' | 'medium' | 'large';
    viewMode: 'card' | 'list';
  };
}

// Define the context type
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateApiToken: (token: string) => void;
  validateApiToken: (token: string) => Promise<boolean>;
}

// Get token from localStorage if available
const getInitialToken = (): string => {
  try {
    // Try to get from localStorage first for immediate access
    return localStorage.getItem(API_TOKEN_STORAGE_KEY) || '';
  } catch (error) {
    console.error('Failed to get token from localStorage', error);
    return '';
  }
};

// Default settings with token from localStorage if available
const defaultSettings: AppSettings = {
  apiToken: getInitialToken(),
  theme: 'system',
  cyberpunkMode: true,
  startupPage: 'home',
  confirmDialogs: {
    deleteTemplate: true,
    applyTemplate: true,
  },
  appearance: {
    density: 'comfortable',
    fontSize: 'medium',
    viewMode: 'card', // Setting card view as default
  },
};

// Create context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  updateApiToken: () => {},
  validateApiToken: async () => false,
});

// Custom hook for using the settings context
export const useSettings = () => useContext(SettingsContext);

// Settings provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // Initialize settings from Dexie or fallback to localStorage for migration
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  // Load settings from Dexie on mount
  useEffect(() => {
    const loadSettingsFromDexie = async () => {
      try {
        // Try to get from localStorage for migration of old settings format
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Migrate to Dexie
          await saveSetting(parsedSettings);
          // Remove from localStorage after migration
          localStorage.removeItem('appSettings');
          
          setSettings({
            ...defaultSettings,
            ...parsedSettings
          });
          
          // Ensure API token is set in the API client
          if (parsedSettings.apiToken) {
            shortcutApi.setApiToken(parsedSettings.apiToken);
          }
          
          return;
        }
        
        // If no localStorage old format, try Dexie
        const dexieSettings = await getSetting<AppSettings>();
        if (dexieSettings) {
          setSettings({
            ...defaultSettings, // Ensure all properties exist
            ...dexieSettings
          });
          
          // Ensure API token is set in the API client
          if (dexieSettings.apiToken) {
            shortcutApi.setApiToken(dexieSettings.apiToken);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        
        // If we fail to load from IndexedDB, check if API token exists in shortcutApiClient storage
        const currentToken = shortcutApi.getApiToken();
        if (currentToken) {
          console.log('Recovered API token from persistence layer');
          setSettings(prev => ({
            ...prev,
            apiToken: currentToken
          }));
        }
      }
    };
    
    loadSettingsFromDexie();
  }, []);

  // Update settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prevSettings) => {
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
      };
      return updatedSettings;
    });
  };

  // Update API token and ensure it's propagated to the API client
  const updateApiToken = (token: string) => {
    // Update the token in the API client first
    shortcutApi.setApiToken(token);
    
    // Then update in our settings state
    setSettings((prevSettings) => {
      const newSettings = {
        ...prevSettings,
        apiToken: token,
      };
      return newSettings;
    });
    
    console.log('API token updated in settings context');
  };

  // Validate API token using direct API client
  const validateApiToken = async (token: string): Promise<boolean> => {
    try {
      const response = await shortcutApi.validateToken(token);
      return response.success;
    } catch (error) {
      return false;
    }
  };

  // Save settings to Dexie when they change
  useEffect(() => {
    saveSetting(settings).catch(error => {
      console.error('Failed to save settings to Dexie:', error);
      // Fallback to localStorage if Dexie fails
      localStorage.setItem('appSettings', JSON.stringify(settings));
    });
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateApiToken,
        validateApiToken,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ShortcutApiResponse } from '../services/shortcutApiClient';
import * as shortcutApi from '../services/shortcutApiClient';
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

// Default settings
const defaultSettings: AppSettings = {
  apiToken: '',
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
        // Try to get from localStorage for migration
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
          return;
        }
        
        // If no localStorage, try Dexie
        const dexieSettings = await getSetting<AppSettings>();
        if (dexieSettings) {
          setSettings({
            ...defaultSettings, // Ensure all properties exist
            ...dexieSettings
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
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

  // Update API token
  const updateApiToken = (token: string) => {
    setSettings((prevSettings) => {
      const newSettings = {
        ...prevSettings,
        apiToken: token,
      };
      return newSettings;
    });
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

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiToken, setApiToken } from '../utils/electronApi';

// Define the settings structure
interface AppSettings {
  apiToken: string; // This will be synced with electron-store
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
}

// Default settings
const defaultSettings: AppSettings = {
  apiToken: '',
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
});

// Custom hook for using the settings context
export const useSettings = () => useContext(SettingsContext);

// Settings provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Load API token from electron-store on initial load
  useEffect(() => {
    const loadApiToken = async () => {
      try {
        const token = await getApiToken();
        if (token) {
          setSettings(prev => ({
            ...prev,
            apiToken: token
          }));
        }
      } catch (error) {
        console.error('Failed to load API token:', error);
      }
    };

    loadApiToken();
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

  // Update API token - also save to electron-store
  const updateApiToken = async (token: string) => {
    try {
      // Save to electron-store
      await setApiToken(token);
      
      // Update local state
      setSettings((prevSettings) => ({
        ...prevSettings,
        apiToken: token,
      }));
    } catch (error) {
      console.error('Failed to update API token:', error);
    }
  };

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateApiToken,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

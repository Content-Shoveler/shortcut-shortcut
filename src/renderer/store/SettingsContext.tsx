import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { validateApiToken as validateToken } from '../utils/shortcutApi';

// Define the settings structure
interface AppSettings {
  apiToken: string;
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
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

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
    setSettings((prevSettings) => ({
      ...prevSettings,
      apiToken: token,
    }));
  };

  // Validate API token
  const validateApiToken = async (token: string): Promise<boolean> => {
    try {
      // Using the existing utility function from shortcutApi.ts
      return await validateToken(token);
    } catch (error) {
      console.error('Error validating API token:', error);
      return false;
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
        validateApiToken,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

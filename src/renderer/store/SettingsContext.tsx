import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ElectronAPI, ShortcutApiResponse } from '../types/electron';

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
    console.log('💾 SettingsContext: updateSettings called with', newSettings);
    setSettings((prevSettings) => {
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
      };
      console.log('💾 SettingsContext: new settings state:', updatedSettings);
      return updatedSettings;
    });
  };

  // Update API token
  const updateApiToken = (token: string) => {
    console.log('💾 SettingsContext: updateApiToken called with token', token ? token.substring(0, 4) + '...' : 'none');
    setSettings((prevSettings) => {
      const newSettings = {
        ...prevSettings,
        apiToken: token,
      };
      console.log('💾 SettingsContext: settings updated with new token');
      return newSettings;
    });
  };

  // Validate API token using the main process IPC method
  const validateApiToken = async (token: string): Promise<boolean> => {
    console.log('💾 SettingsContext: validateApiToken called with token', token ? token.substring(0, 4) + '...' : 'none');
    
    try {
      // Using the IPC method which handles API calls in the main process (bypassing CORS)
      // Use type assertion to tell TypeScript about the shortcutApi property
      type APIWithShortcut = typeof window.electronAPI & {
        shortcutApi: {
          validateToken: (token: string) => Promise<ShortcutApiResponse>;
        }
      };
      
      console.log('💾 SettingsContext: Calling Electron IPC validateToken method');
      const api = window.electronAPI as APIWithShortcut;
      const response = await api.shortcutApi.validateToken(token);
      console.log('💾 SettingsContext: Token validation response:', response);
      
      // Log the important state after validation
      console.log('💾 SettingsContext: Token valid:', response.success);
      console.log('💾 SettingsContext: Current settings.apiToken:', 
                  settings.apiToken ? settings.apiToken.substring(0, 4) + '...' : 'none');
      
      return response.success;
    } catch (error) {
      console.error('💾 SettingsContext: Error validating API token:', error);
      return false;
    }
  };

  // Save settings to localStorage when they change
  useEffect(() => {
    console.log('💾 SettingsContext: Settings changed, updating localStorage');
    console.log('💾 SettingsContext: New settings:', {
      ...settings,
      apiToken: settings.apiToken ? settings.apiToken.substring(0, 4) + '...' : 'none'
    });
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Log what was actually saved to localStorage
    const savedSettings = localStorage.getItem('appSettings');
    try {
      const parsed = JSON.parse(savedSettings || '{}');
      console.log('💾 SettingsContext: Confirmed localStorage state:', {
        ...parsed,
        apiToken: parsed.apiToken ? parsed.apiToken.substring(0, 4) + '...' : 'none'
      });
    } catch (e) {
      console.error('💾 SettingsContext: Error parsing localStorage:', e);
    }
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

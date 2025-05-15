import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Define theme mode type
type ThemeMode = 'system' | 'light' | 'dark';

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

// Theme Context Type
interface ThemeContextType {
  mode: ThemeMode;
  themeAppearance: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
}

// Settings Context Type
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
    viewMode: 'list',
  },
};

// Create contexts with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  themeAppearance: 'light',
  setTheme: () => {},
});

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  updateApiToken: () => {},
  validateApiToken: async () => false,
});

// Export hooks for using the contexts
export const useTheme = () => useContext(ThemeContext);
export const useSettings = () => useContext(SettingsContext);

// Create theme based on settings
const createAppTheme = (mode: 'light' | 'dark', density: 'comfortable' | 'compact', fontSize: 'small' | 'medium' | 'large') => {
  // Calculate spacing unit based on density
  const spacingUnit = density === 'comfortable' ? 8 : 4;
  
  // Calculate font size factors
  const fontSizeFactors = {
    small: 0.875,
    medium: 1,
    large: 1.125
  };
  
  const fontSizeFactor = fontSizeFactors[fontSize];
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#5F9EA0' : '#FFFFFF',
      },
      secondary: {
        main: mode === 'light' ? '#FF4500' : '#5F9EA0',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      ...(mode === 'dark' && {
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
      }),
    },
    spacing: spacingUnit,
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: 14 * fontSizeFactor,
      h1: { fontSize: `${2.5 * fontSizeFactor}rem` },
      h2: { fontSize: `${2 * fontSizeFactor}rem` },
      h3: { fontSize: `${1.75 * fontSizeFactor}rem` },
      h4: { fontSize: `${1.5 * fontSizeFactor}rem` },
      h5: { fontSize: `${1.25 * fontSizeFactor}rem` },
      h6: { fontSize: `${1 * fontSizeFactor}rem` },
      body1: { fontSize: `${1 * fontSizeFactor}rem` },
      body2: { fontSize: `${0.875 * fontSizeFactor}rem` },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });
};

// Import validation function
import { validateApiToken as validateToken } from '../utils/shortcutApi';

// Combined provider component
interface AppProvidersProps {
  children: ReactNode;
}

import { SettingsProvider } from './SettingsContext';
import { ThemeProvider } from './ThemeContext';
import { CacheProvider } from './CacheContext';

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <CacheProvider>
          {children}
        </CacheProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
};

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

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  // === SETTINGS PROVIDER LOGIC ===
  
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('appSettings');
    
    try {
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Ensure we have all required fields by merging with defaults
        return { ...defaultSettings, ...parsedSettings };
      }
    } catch (error) {
      // Error parsing settings
    }
    
    return defaultSettings;
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
    // First update the context state
    setSettings((prevSettings) => {
      const newSettings = {
        ...prevSettings,
        apiToken: token,
      };
      return newSettings;
    });
    
    // Also directly update localStorage to ensure synchronization
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        parsedSettings.apiToken = token;
        localStorage.setItem('appSettings', JSON.stringify(parsedSettings));
      }
    } catch (error) {
      // Error updating localStorage
    }
  };

  // Validate API token
  const validateApiToken = async (token: string): Promise<boolean> => {
    try {
      return await validateToken(token);
    } catch (error) {
      return false;
    }
  };

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // === THEME PROVIDER LOGIC ===
  
  // Check for system preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultAppearance = prefersDarkMode ? 'dark' : 'light';
  
  // Try to get saved theme mode from localStorage, default to 'system'
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'system';
  });
  
  // Track the actual theme appearance (light/dark)
  const [themeAppearance, setThemeAppearance] = useState<'light' | 'dark'>(
    mode === 'system' ? defaultAppearance : mode as 'light' | 'dark'
  );

  // Handler for setting theme
  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        setThemeAppearance(e.matches ? 'dark' : 'light');
      }
    };
    
    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode]);
  
  // Update themeAppearance when mode changes
  useEffect(() => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeAppearance(prefersDark ? 'dark' : 'light');
    } else {
      setThemeAppearance(mode as 'light' | 'dark');
    }
    
    // Save mode to localStorage
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Get current density and font size from settings
  const { density, fontSize } = settings.appearance;

  // Create the theme based on appearance and settings
  const theme = createAppTheme(themeAppearance, density, fontSize);

  // Combine both providers
  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateApiToken,
        validateApiToken,
      }}
    >
      <ThemeContext.Provider value={{ mode, themeAppearance, setTheme }}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </ThemeContext.Provider>
    </SettingsContext.Provider>
  );
};

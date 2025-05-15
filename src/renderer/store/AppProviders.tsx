import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from './CacheContext';
import { SettingsProvider, useSettings } from './SettingsContext';
import { AppSettings } from '../services/dexieService';

// Define theme mode type
type ThemeMode = 'system' | 'light' | 'dark';

// Theme Context Type
interface ThemeContextType {
  mode: ThemeMode;
  themeAppearance: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  themeAppearance: 'light',
  setTheme: () => {},
});

// Export hook for using the context
export const useTheme = () => useContext(ThemeContext);

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

// ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContextProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSettings();
  
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

  return (
    <ThemeContext.Provider value={{ mode, themeAppearance, setTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Combined provider component
interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SettingsProvider>
      <CacheProvider>
        <ThemeContextProvider>
          {children}
        </ThemeContextProvider>
      </CacheProvider>
    </SettingsProvider>
  );
};

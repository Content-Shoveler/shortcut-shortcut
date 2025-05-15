import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSettings } from './SettingsContext';
import { settingsStorage, ThemeMode } from '../services/storage/SettingsStorage';

// Define context type
interface ThemeContextType {
  mode: ThemeMode;
  themeAppearance: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  themeAppearance: 'dark',
  setTheme: () => {},
});

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

// Define cyberpunk theme colors - space/NASA inspired
const cyberpunkColors = {
  // Extended cadetBlue palette as requested
  cadetBlue: {
    main: '#5F9EA0',    // Primary cadetBlue
    light: '#8BCED0',   // Lighter variation
    dark: '#3A7173',    // Darker variation
    accent: '#7FDBDC',  // Accent variation
    muted: '#4D7F81',   // Muted variation
    bright: '#00CED1',  // Bright variation (dark cyan)
    contrastText: '#FFFFFF',
  },
  // Space/NASA inspired colors
  space: {
    deepSpace: '#0A0E17',       // Deep space black/blue
    cosmos: '#171D2E',          // Cosmic background
    stars: '#E0E8FF',           // Distant stars
    nebula: '#4D6BC6',          // Nebula blue
    orbit: '#3A4CA8',           // Orbital path blue
    nasa: '#0B3D91',            // NASA blue
    warning: '#FF7E11',         // Warning orange (NASA)
    terminal: '#00FF41',        // Terminal green (retro NASA screens)
  },
  neon: {
    cyan: '#00FFFF',            // Neon cyan
    teal: '#0AFACA',            // Teal variation
    green: '#39FF14',           // Neon green
    yellow: '#FFFF00',          // Neon yellow
    orange: '#FF9500',          // Neon orange
  },
  dark: {
    main: '#0A0E17',            // Main dark background
    light: '#1A1E27',           // Lighter dark
    medium: '#141824',          // Medium dark
    paper: 'rgba(20, 24, 36, 0.8)', // Semi-transparent
    terminal: '#0C0C14',        // Terminal background
  },
  light: {
    main: '#E0FFFF',            // Light cyan background
    medium: '#D0E7E7',          // Medium light
    dark: '#BACECF',            // Dark light
    paper: 'rgba(224, 255, 255, 0.9)', // Semi-transparent
  },
  accents: {
    red: '#FF3E3E',             // Error red
    caution: '#FFCE00',         // Caution yellow
    success: '#00E64D',         // Success green
    alert: '#FF9500',           // Alert orange
    blue: '#4BB2F9',            // Info blue (adding this since it was missing)
  }
};

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
  
  // Cyberpunk gradient strings
  const gradients = {
    header: mode === 'dark' 
      ? 'linear-gradient(90deg, rgba(10, 14, 23, 0.95) 0%, rgba(95, 158, 160, 0.7) 100%)'
      : 'linear-gradient(90deg, rgba(186, 206, 207, 0.95) 0%, rgba(95, 158, 160, 0.7) 100%)',
    button: mode === 'dark'
      ? 'linear-gradient(45deg, rgba(95, 158, 160, 0.9) 0%, rgba(0, 255, 255, 0.6) 100%)'
      : 'linear-gradient(45deg, rgba(95, 158, 160, 0.9) 0%, rgba(0, 255, 255, 0.7) 100%)',
    card: mode === 'dark'
      ? 'linear-gradient(135deg, rgba(20, 24, 36, 0.9) 0%, rgba(26, 30, 39, 0.8) 100%)'
      : 'linear-gradient(135deg, rgba(224, 255, 255, 0.85) 0%, rgba(208, 231, 231, 0.75) 100%)',
  };
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: cyberpunkColors.cadetBlue.main,
        light: cyberpunkColors.cadetBlue.light,
        dark: cyberpunkColors.cadetBlue.dark,
        contrastText: cyberpunkColors.cadetBlue.contrastText,
      },
      secondary: {
        main: cyberpunkColors.neon.cyan, 
        light: cyberpunkColors.cadetBlue.accent,
        dark: cyberpunkColors.cadetBlue.muted,
        contrastText: '#000000',
      },
      background: {
        default: mode === 'light' ? cyberpunkColors.light.main : cyberpunkColors.dark.main,
        paper: mode === 'light' ? cyberpunkColors.light.paper : cyberpunkColors.dark.paper,
      },
      text: {
        primary: mode === 'light' ? '#103037' : '#E0FFFF',
        secondary: mode === 'light' ? '#2A616B' : '#8BCED0',
      },
      error: {
        main: cyberpunkColors.accents.red,
      },
      warning: {
        main: cyberpunkColors.neon.yellow,
      },
      info: {
        main: cyberpunkColors.accents.blue,
      },
      success: {
        main: cyberpunkColors.neon.green,
      },
    },
    spacing: spacingUnit,
    shape: {
      borderRadius: 4,
    },
    typography: {
      fontFamily: [
        '"Rajdhani"',
        '"Share Tech Mono"',
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: 14 * fontSizeFactor,
      h1: { 
        fontSize: `${2.5 * fontSizeFactor}rem`,
        fontWeight: 600,
        letterSpacing: '0.05em',
      },
      h2: { 
        fontSize: `${2 * fontSizeFactor}rem`,
        fontWeight: 500,
        letterSpacing: '0.04em',
      },
      h3: { 
        fontSize: `${1.75 * fontSizeFactor}rem`,
        fontWeight: 500,
        letterSpacing: '0.03em',
      },
      h4: { 
        fontSize: `${1.5 * fontSizeFactor}rem`,
        fontWeight: 500,
        letterSpacing: '0.03em',
      },
      h5: { 
        fontSize: `${1.25 * fontSizeFactor}rem`,
        fontWeight: 500,
        letterSpacing: '0.02em',
      },
      h6: { 
        fontSize: `${1 * fontSizeFactor}rem`,
        fontWeight: 500,
        letterSpacing: '0.02em',
      },
      body1: { 
        fontSize: `${1 * fontSizeFactor}rem`,
        letterSpacing: '0.01em',
      },
      body2: { 
        fontSize: `${0.875 * fontSizeFactor}rem`,
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: mode === 'dark' 
              ? `linear-gradient(rgba(10, 14, 23, 0.97), rgba(10, 14, 23, 0.97)), 
                 url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%235f9ea0' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E"),
                 url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235f9ea0' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              : `linear-gradient(rgba(224, 255, 255, 0.97), rgba(224, 255, 255, 0.97)), 
                 url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%235f9ea0' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundAttachment: 'fixed',
            backgroundSize: '100% 100%, 20px 20px, 60px 60px',
          },
          ':root': {
            '--cyberpunk-header-gradient': gradients.header,
            '--cyberpunk-button-gradient': gradients.button,
            '--cyberpunk-card-gradient': gradients.card,
            '--cyberpunk-glow': mode === 'dark' ? '0 0 10px rgba(0, 255, 255, 0.5)' : 'none',
            '--cyberpunk-border-light': `1px solid ${mode === 'dark' ? 'rgba(139, 206, 208, 0.5)' : 'rgba(95, 158, 160, 0.5)'}`,
            '--cyberpunk-border-accent': mode === 'dark' ? `2px solid ${cyberpunkColors.neon.cyan}` : `2px solid ${cyberpunkColors.cadetBlue.main}`,
            '--cyberpunk-scan-line-bg': `repeating-linear-gradient(to bottom, transparent 0px, transparent 1px, ${alpha(cyberpunkColors.cadetBlue.dark, 0.05)} 1px, ${alpha(cyberpunkColors.cadetBlue.dark, 0.05)} 2px)`,
            '--cyberpunk-grid-bg': `linear-gradient(${alpha(cyberpunkColors.cadetBlue.dark, 0.1)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(cyberpunkColors.cadetBlue.dark, 0.1)} 1px, transparent 1px)`,
            '--cyberpunk-space-bg': mode === 'dark' ? `radial-gradient(circle at top right, ${alpha(cyberpunkColors.space.nebula, 0.3)} 0%, transparent 60%)` : 'none',
            '--text-color': mode === 'dark' ? '#FFFFFF' : '#FFFFFF', // White text for both modes for the cyber-neon effect
            '--primary-color': mode === 'dark' ? cyberpunkColors.cadetBlue.main : '#FFFFFF',
          }
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'var(--cyberpunk-header-gradient)',
            boxShadow: mode === 'dark' ? 'var(--cyberpunk-glow)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderBottom: 'var(--cyberpunk-border-light)',
            backdropFilter: 'blur(5px)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${cyberpunkColors.neon.cyan} 50%, transparent 100%)`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: '"Rajdhani", sans-serif',
            textTransform: 'none',
            fontWeight: 600,
            position: 'relative',
            letterSpacing: '0.05em',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              padding: '1px',
              background: `linear-gradient(45deg, transparent 25%, ${alpha(cyberpunkColors.cadetBlue.bright, 0.5)} 50%, transparent 75%)`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover::before': {
              opacity: 1,
            },
          },
          contained: {
            background: 'var(--cyberpunk-button-gradient)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--cyberpunk-scan-line-bg)',
              opacity: 0.2,
              pointerEvents: 'none',
            },
            '&:hover': {
              background: 'var(--cyberpunk-button-gradient)',
              boxShadow: 'var(--cyberpunk-glow)',
              transform: 'translateY(-2px)',
            },
          },
          outlined: {
            borderColor: cyberpunkColors.cadetBlue.main,
            '&:hover': {
              borderColor: cyberpunkColors.neon.cyan,
              boxShadow: 'var(--cyberpunk-glow)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'var(--cyberpunk-card-gradient)',
            backdropFilter: 'blur(10px)',
            borderRadius: '2px',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 'inherit',
              padding: '1px',
              background: `linear-gradient(135deg, transparent, ${alpha(cyberpunkColors.cadetBlue.main, 0.5)}, transparent)`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
            },
            // Add retro terminal scanlines
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--cyberpunk-scan-line-bg)',
              opacity: 0.05,
              pointerEvents: 'none',
              zIndex: 0
            }
          },
          elevation1: {
            boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
          elevation3: {
            boxShadow: mode === 'dark' ? '0 8px 25px rgba(0, 0, 0, 0.6)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            position: 'relative',
            overflow: 'visible',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '20px',
              height: '20px',
              borderTop: 'var(--cyberpunk-border-accent)',
              borderLeft: 'var(--cyberpunk-border-accent)',
              top: 0,
              left: 0,
              borderTopLeftRadius: '2px',
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            '&:last-child': {
              paddingBottom: 16,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: 'var(--cyberpunk-glow)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: cyberpunkColors.cadetBlue.main,
                transition: 'all 0.3s ease',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: cyberpunkColors.neon.cyan,
                boxShadow: mode === 'dark' ? '0 0 5px rgba(0, 255, 255, 0.3)' : 'none',
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            borderBottom: 'var(--cyberpunk-border-light)',
          },
          root: {
            borderBottom: '1px solid rgba(95, 158, 160, 0.2)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(0, 255, 255, 0.05)' : 'rgba(95, 158, 160, 0.05)',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? 'rgba(139, 206, 208, 0.2)' : 'rgba(95, 158, 160, 0.2)',
            '&::before, &::after': {
              borderColor: mode === 'dark' ? 'rgba(139, 206, 208, 0.2)' : 'rgba(95, 158, 160, 0.2)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
          },
          outlined: {
            borderColor: cyberpunkColors.cadetBlue.main,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'dark' ? cyberpunkColors.dark.light : cyberpunkColors.light.dark,
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            border: 'var(--cyberpunk-border-light)',
            fontSize: '0.75rem',
          },
        },
      },
    },
  });
};

// A ThemeProvider that must be wrapped inside a SettingsProvider
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Notice: This component must be used inside a SettingsProvider
  const settingsContext = useSettings();

  // Check for system preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultAppearance = prefersDarkMode ? 'dark' : 'light';
  
  // Use both state and ref to track the theme mode
  // This ensures we can both trigger re-renders (with state) and
  // access the current value inside closures (with ref)
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const modeRef = React.useRef<ThemeMode>('dark');
  
  // Function to update both state and ref
  const setMode = (newMode: ThemeMode) => {
    modeRef.current = newMode; // Update ref immediately
    setModeState(newMode);     // Update state to trigger re-render
  };
  
  // Load theme from settings on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Load settings from IndexedDB
        const settings = await settingsStorage.getSettings();
        const savedTheme = settings.appearance.theme;
        
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          console.log('Loaded theme from settings:', savedTheme);
          
          // Update both ref and state
          modeRef.current = savedTheme;
          setModeState(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme from settings:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  // Track the actual theme appearance (light/dark)
  const [themeAppearance, setThemeAppearance] = useState<'light' | 'dark'>(
    modeRef.current === 'system' ? defaultAppearance : modeRef.current as 'light' | 'dark'
  );

  // Handler for setting theme
  const setTheme = (newMode: ThemeMode) => {
    console.log('ThemeContext: Setting theme to:', newMode, '(previous was:', modeRef.current, ')');
    
    // Always use the ref for immediate access to current value
    const prevMode = modeRef.current;
    
    // Update both state and ref
    modeRef.current = newMode;
    setModeState(newMode);
    
    console.log('ThemeContext: Updated ref value to:', modeRef.current);
    
    // Save to IndexedDB through settings storage
    try {
      const currentSettings = settingsContext?.settings;
      
      // Only update if we have valid settings
      if (currentSettings && currentSettings.appearance) {
        settingsStorage.updateSettings({
          appearance: {
            ...currentSettings.appearance, // Keep existing appearance settings
            theme: newMode              // Update only the theme
          }
        });
        console.log('ThemeContext: Theme saved to settings storage');
      } else {
        // If we don't have access to current settings, just save the theme directly
        settingsStorage.updateSettings({
          appearance: {
            density: 'comfortable',
            fontSize: 'medium',
            viewMode: 'card',
            theme: newMode
          }
        });
        console.log('ThemeContext: Theme saved to settings storage (with defaults)');
      }
    } catch (storageError: unknown) {
      console.error('ThemeContext: Failed to save theme to settings storage:', storageError);
    }
    
    // Force an immediate theme appearance update based on the new mode
    const newAppearance = newMode === 'system' 
      ? (prefersDarkMode ? 'dark' : 'light') 
      : newMode as 'light' | 'dark';
      
    setThemeAppearance(newAppearance);
    console.log('ThemeContext: Updated appearance to:', newAppearance);
    
    // Force a UI update if needed using the ref (not the state which might be stale in closure)
    setTimeout(() => {
      console.log('ThemeContext: Checking theme mode after update:', modeRef.current);
    }, 0);
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
    console.log('Theme mode changed to:', mode, '(ref value:', modeRef.current, ')');
    
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('System preference is:', prefersDark ? 'dark' : 'light');
      setThemeAppearance(prefersDark ? 'dark' : 'light');
    } else {
      setThemeAppearance(mode as 'light' | 'dark');
    }
    
    // Ensure mode and ref are in sync (they might get out of sync in rare cases)
    if (mode !== modeRef.current) {
      console.log('Synchronizing ref with state:', mode);
      modeRef.current = mode;
    }
    
    // NOTE: Settings are saved directly in the setTheme function
    // This prevents circular dependency between theme changes and settings updates
  }, [mode]); // Removed settingsContext from dependencies

  // Get density and font size from settings
  const { density, fontSize } = settingsContext.settings.appearance;

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

/**
 * Cyberpunk Design System Tokens
 * 
 * This file contains all design tokens for the cyberpunk styling system.
 * Use these tokens to maintain consistency across the application.
 */
export const cyberpunkTokens = {
  // Corner clipping sizes
  cornerClip: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 15,
    xl: 20,
  },
  // Glow intensity levels
  glow: {
    none: 0,
    low: 0.3,
    medium: 0.5,
    high: 0.7,
    intense: 1,
  },
  // Animation durations
  animation: {
    dataFlow: {
      slow: 3,
      medium: 1.5,
      fast: 0.8,
    },
    pulse: {
      slow: 3,
      medium: 1.5,
      fast: 0.8,
    },
    scanline: {
      slow: 2,
      medium: 1,
      fast: 0.5,
    }
  },
  // Scanline properties
  scanline: {
    opacity: {
      low: 0.03,
      medium: 0.05,
      high: 0.1,
    },
    size: {
      thin: 1,
      medium: 2,
      thick: 3,
    }
  },
  // Font families
  fonts: {
    display: "'Rajdhani', sans-serif",
    mono: "'Share Tech Mono', monospace",
    body: "'Roboto', 'Helvetica', 'Arial', sans-serif"
  },
  // Z-index values
  zIndex: {
    base: 1,
    hover: 2,
    dropdown: 10,
    sticky: 100,
    modal: 1000,
    tooltip: 1500,
  }
};

// Export individual token groups for direct imports
export const { cornerClip, glow, animation, scanline, fonts, zIndex } = cyberpunkTokens;

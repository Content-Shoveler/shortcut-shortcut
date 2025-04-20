import { alpha, Theme } from '@mui/material';
import { cornerClip, glow as glowTokens, scanline as scanlineTokens } from '../theme/cyberpunkTokens';

/**
 * Common utility functions for cyberpunk styling
 */

/**
 * Returns the clip-path CSS property for corner clipping effect
 * 
 * @param size The size of the corner clip (from cornerClip tokens or custom number)
 * @returns A CSS clip-path property value for corner clipping
 */
export const getCornerClipPath = (size: keyof typeof cornerClip | number = 'md') => {
  // If size is a token name, get the value from cornerClip
  const clipSize = typeof size === 'string' ? cornerClip[size] : size;
  
  // Return the clip-path property value
  return `polygon(
    0 0, 
    calc(100% - ${clipSize}px) 0, 
    100% ${clipSize}px, 
    100% 100%, 
    ${clipSize}px 100%, 
    0 calc(100% - ${clipSize}px)
  )`;
};

/**
 * Returns the glow effect CSS for an element
 * 
 * @param theme The current MUI theme
 * @param color The color for the glow (defaults to theme.palette.secondary.main)
 * @param intensity The intensity of the glow (from glowTokens or custom number between 0-1)
 * @returns CSS box-shadow value for glow effect
 */
export const getGlowEffect = (
  theme: Theme, 
  color?: string, 
  intensity: keyof typeof glowTokens | number = 'medium'
) => {
  // Use provided color or default to theme secondary color
  const glowColor = color || theme.palette.secondary.main;
  
  // Get intensity value from tokens if a key is provided, otherwise use the number directly
  const glowIntensity = typeof intensity === 'string' ? glowTokens[intensity] : intensity;

  // Adjust glow effect based on theme mode
  return theme.palette.mode === 'dark'
    ? `0 0 ${8 * glowIntensity}px ${alpha(glowColor, 0.7)}`
    : `0 0 ${5 * glowIntensity}px ${alpha(glowColor, 0.3)}`;
};

/**
 * Returns the CSS for corner accent styling
 * 
 * @param theme The current MUI theme
 * @param size The size of the corner accents
 * @param color The color for the corners (defaults to theme.palette.secondary.main)
 * @returns CSS properties for corner accents
 */
export const getCornerAccents = (
  theme: Theme,
  size: number = 8,
  color?: string
) => {
  const accentColor = color || theme.palette.secondary.main;
  
  return {
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: `${size}px`,
      height: `${size}px`,
      borderTop: `2px solid ${accentColor}`,
      borderRight: `2px solid ${accentColor}`,
      zIndex: 1,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: `${size}px`,
      height: `${size}px`,
      borderBottom: `2px solid ${accentColor}`,
      borderLeft: `2px solid ${accentColor}`,
      zIndex: 1,
    }
  };
};

/**
 * Returns CSS for scanline effect
 * 
 * @param direction Direction of the scanlines
 * @param opacity Opacity of the scanlines (from scanlineTokens or custom number between 0-1)
 * @param size Size/thickness of scanlines (from scanlineTokens or custom number)
 * @returns CSS properties for scanline effect
 */
export const getScanlineStyles = (
  direction: 'horizontal' | 'vertical' = 'horizontal',
  opacity: keyof typeof scanlineTokens.opacity | number = 'medium',
  size: keyof typeof scanlineTokens.size | number = 'medium'
) => {
  // Get values from tokens if keys are provided, otherwise use the numbers directly
  const opacityValue = typeof opacity === 'string' ? scanlineTokens.opacity[opacity] : opacity;
  const sizeValue = typeof size === 'string' ? scanlineTokens.size[size] : size;
  
  const isHorizontal = direction === 'horizontal';
  
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    opacity: opacityValue,
    backgroundImage: `repeating-linear-gradient(
      ${isHorizontal ? '0deg' : '90deg'},
      currentColor,
      currentColor ${sizeValue}px,
      transparent ${sizeValue}px,
      transparent ${sizeValue * 2}px
    )`,
    backgroundSize: isHorizontal ? `100% ${sizeValue * 2}px` : `${sizeValue * 2}px 100%`,
    zIndex: 1,
  };
};

/**
 * Returns CSS for data flow animation effect
 * 
 * @param theme The current MUI theme
 * @param color The color for the data flow (defaults to theme.palette.primary.main)
 * @param direction Direction of the flow ('ltr', 'rtl', 'ttb', 'btt')
 * @returns CSS properties for data flow effect
 */
export const getDataFlowStyles = (
  theme: Theme,
  color?: string,
  direction: 'ltr' | 'rtl' | 'ttb' | 'btt' = 'ltr'
) => {
  const flowColor = color || theme.palette.primary.main;
  
  // Determine gradient and animation direction
  let gradient: string;
  let initialPosition: object;
  let animatePosition: object;
  
  switch (direction) {
    case 'rtl': // right to left
      gradient = `linear-gradient(90deg, transparent 0%, ${alpha(flowColor, 0.2)} 50%, transparent 100%)`;
      initialPosition = { right: '-100%' };
      animatePosition = { right: '100%' };
      break;
    case 'ttb': // top to bottom
      gradient = `linear-gradient(180deg, transparent 0%, ${alpha(flowColor, 0.2)} 50%, transparent 100%)`;
      initialPosition = { top: '-100%' };
      animatePosition = { top: '100%' };
      break;
    case 'btt': // bottom to top
      gradient = `linear-gradient(180deg, transparent 0%, ${alpha(flowColor, 0.2)} 50%, transparent 100%)`;
      initialPosition = { bottom: '-100%' };
      animatePosition = { bottom: '100%' };
      break;
    default: // left to right
      gradient = `linear-gradient(90deg, transparent 0%, ${alpha(flowColor, 0.2)} 50%, transparent 100%)`;
      initialPosition = { left: '-100%' };
      animatePosition = { left: '100%' };
  }
  
  return {
    container: {
      position: 'relative',
      overflow: 'hidden',
    },
    animation: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: gradient,
      zIndex: 0,
      pointerEvents: 'none',
      ...initialPosition,
      // Animation will be handled by framer-motion
    },
    initialPosition,
    animatePosition,
  };
};

/**
 * Common interface for all cyberpunk components
 */
export interface CyberBaseProps {
  /** Enables angular corner clipping effect */
  cornerClip?: boolean | keyof typeof cornerClip;
  /** Adds animated scanline overlay */
  scanlineEffect?: boolean;
  /** Controls the intensity of the glow effect (0-1) */
  glowIntensity?: keyof typeof glowTokens | number;
  /** Custom accent color (defaults to theme.palette.secondary.main) */
  accentColor?: string;
  /** Enables data flow animation effect */
  dataFlow?: boolean;
}

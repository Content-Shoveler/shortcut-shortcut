import { useTheme } from '@mui/material';
import React from 'react';

/**
 * Simple mock for Rive animations to support our theming
 * This is a placeholder until actual Rive animations are added
 */

// Simple type definitions
type StateMachineInput = {
  value: any;
  setValue: (val: any) => void;
};

// Simple mock for RiveComponent
const createRiveComponent = (theme: any) => {
  return function RiveComponent(props: { className?: string; style?: React.CSSProperties }) {
    return React.createElement('div', {
      className: props.className,
      style: {
        ...props.style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px dashed ${theme.palette.primary.main}`,
        padding: '8px',
        color: theme.palette.secondary.main,
        fontFamily: '"Share Tech Mono", monospace',
      }
    }, '[RIVE ANIMATION]');
  };
};

// Main hook
export function useCyberpunkRive(options: { 
  src: string;
  stateMachines?: string;
  artboards?: string;
}) {
  const theme = useTheme();
  
  // Create inputs
  const inputs = {
    scanIntensity: {
      value: 0.5,
      setValue: (_val: any) => {}
    },
    speed: {
      value: 1.0,
      setValue: (_val: any) => {}
    }
  };
  
  // Create component
  const RiveComponent = createRiveComponent(theme);
  
  // Mock rive object
  const rive = { contents: {} };
  
  return { rive, inputs, RiveComponent };
}

// Helper functions
export function loadRiveAnimation(fileName: string, options = {}) {
  return useCyberpunkRive({
    src: `/src/renderer/assets/rive/${fileName}.riv`,
    ...options
  });
}

// Animation presets
export const cyberpunkAnimations = {
  loadingSpinner: (options = {}) => 
    loadRiveAnimation('loading_spinner', options),
  
  radarScan: (options = {}) => 
    loadRiveAnimation('radar_scan', options),
  
  terminalTyping: (options = {}) => 
    loadRiveAnimation('terminal_typing', options),
  
  spaceBackground: (options = {}) => 
    loadRiveAnimation('space_bg', options),
  
  dataTransfer: (options = {}) => 
    loadRiveAnimation('data_transfer', options),
};

// Information function
export function setupRiveFolders(): void {
  // Rive animations should be placed in /src/renderer/assets/rive/
}

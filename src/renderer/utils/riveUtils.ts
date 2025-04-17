import { useRive, UseRiveParameters, RiveState } from '@rive-app/react-canvas';

// Default Rive animation options with optimized settings
export const defaultRiveOptions = {
  autoplay: true,
  fitCanvasToArtboardHeight: true,
};

// Simple hook for Rive animations
export const useCyberpunkRive = (params: UseRiveParameters) => {
  return useRive({
    ...defaultRiveOptions,
    ...params,
  });
};

// Cyberpunk animation assets paths
export const cyberpunkRiveAssets = {
  // Loaders
  dataLoader: '/assets/rive/data_loader.riv',
  scanningLoader: '/assets/rive/scanning_loader.riv',
  
  // Icons
  addIcon: '/assets/rive/add_icon.riv',
  settingsIcon: '/assets/rive/settings_icon.riv',
  homeIcon: '/assets/rive/home_icon.riv',
  
  // Buttons
  cyberpunkButton: '/assets/rive/cyberpunk_button.riv',
  
  // Decorative
  backgroundGrid: '/assets/rive/background_grid.riv',
  dataScan: '/assets/rive/data_scan.riv',
  
  // Placeholder URLs - these will need to be created or sourced
  placeholder: '/assets/rive/placeholder.riv',
};

// Set a boolean input on a state machine
export const setRiveBooleanInput = (
  riveState: RiveState | null,
  stateMachineName: string, 
  inputName: string, 
  value: boolean
): boolean => {
  if (!riveState?.rive) return false;
  
  try {
    const inputs = riveState.rive.stateMachineInputs(stateMachineName);
    if (!inputs) return false;
    
    const input = inputs.find(input => input.name === inputName);
    if (!input) return false;
    
    // Try to set the value - wrap in try/catch to handle any type mismatches
    try {
      input.value = value;
      return true;
    } catch (e) {
      console.error('Failed to set boolean input:', e);
      return false;
    }
  } catch (e) {
    console.error('Error accessing state machine inputs:', e);
    return false;
  }
};

// Set a number input on a state machine
export const setRiveNumberInput = (
  riveState: RiveState | null,
  stateMachineName: string, 
  inputName: string, 
  value: number
): boolean => {
  if (!riveState?.rive) return false;
  
  try {
    const inputs = riveState.rive.stateMachineInputs(stateMachineName);
    if (!inputs) return false;
    
    const input = inputs.find(input => input.name === inputName);
    if (!input) return false;
    
    // Try to set the value - wrap in try/catch to handle any type mismatches
    try {
      input.value = value;
      return true;
    } catch (e) {
      console.error('Failed to set number input:', e);
      return false;
    }
  } catch (e) {
    console.error('Error accessing state machine inputs:', e);
    return false;
  }
};

// Fire a trigger input on a state machine
export const fireRiveTrigger = (
  riveState: RiveState | null,
  stateMachineName: string, 
  inputName: string
): boolean => {
  if (!riveState?.rive) return false;
  
  try {
    const inputs = riveState.rive.stateMachineInputs(stateMachineName);
    if (!inputs) return false;
    
    const input = inputs.find(input => input.name === inputName);
    if (!input) return false;
    
    // Try to fire the trigger - wrap in try/catch to handle any type mismatches
    try {
      input.fire();
      return true;
    } catch (e) {
      console.error('Failed to fire trigger:', e);
      return false;
    }
  } catch (e) {
    console.error('Error accessing state machine inputs:', e);
    return false;
  }
};

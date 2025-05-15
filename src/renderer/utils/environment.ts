/**
 * Environment detection utilities
 * 
 * This file provides utilities for detecting the current runtime environment
 * and accessing environment-specific features safely.
 */

/**
 * Checks if the app is running in Electron environment
 * This uses multiple detection methods for robustness
 */
export const isElectron = (): boolean => {
  // Main detection method
  const hasElectronAPI = window.electronAPI !== undefined;
  
  // Secondary detection methods (more reliable)
  const userAgent = navigator.userAgent.toLowerCase();
  const hasElectronInUserAgent = userAgent.indexOf('electron/') !== -1;
  
  // For debugging
  console.log('Environment detection:', { 
    hasElectronAPI, 
    hasElectronInUserAgent,
    userAgent
  });
  
  // If we're in Electron, both conditions should be true
  // If we're in web, both should be false
  // If there's a mismatch, log a warning but trust the user agent check
  if (hasElectronAPI !== hasElectronInUserAgent) {
    console.warn('Environment detection mismatch:', {
      hasElectronAPI,
      hasElectronInUserAgent
    });
  }
  
  // Use the more reliable user agent check instead of just API check
  return hasElectronInUserAgent;
};

/**
 * Gets information about the current environment
 */
export const getEnvironment = () => ({
  isElectron: isElectron(),
  isWeb: !isElectron(),
});

/**
 * Safely access Electron API features
 * Will return undefined if running in web environment
 */
export const getElectronAPI = () => {
  if (isElectron()) {
    return window.electronAPI;
  }
  return undefined;
};

/**
 * Environment detection utilities
 * 
 * This file provides utilities for detecting the current runtime environment
 * and accessing environment-specific features safely.
 */

/**
 * Checks if the app is running in Electron environment
 */
export const isElectron = (): boolean => {
  return window.electronAPI !== undefined;
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

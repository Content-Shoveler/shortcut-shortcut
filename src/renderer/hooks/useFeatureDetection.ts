/**
 * Feature Detection Hook
 * 
 * This hook provides components with information about available features
 * and environment capabilities. It can be used to conditionally render
 * UI elements or adapt behavior based on the current environment.
 */

import { useMemo } from 'react';
import { FeatureDetectionService, Feature } from '../services/features/FeatureDetectionService';

/**
 * Types of environment
 */
export type Environment = 'electron' | 'web';

/**
 * Browser types
 */
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'other';

/**
 * Feature detection hook result
 */
export interface FeatureDetectionResult {
  // Environment information
  environment: Environment;
  isElectron: boolean;
  isWeb: boolean;
  browserType: BrowserType | null;
  
  // Feature availability
  canAccessFileSystem: boolean;
  canUseFileSaveDialog: boolean;
  canUseFileOpenDialog: boolean;
  canDetectSystemTheme: boolean;
  hasIndexedDB: boolean;
  hasLocalStorage: boolean;
  
  // Helper methods
  isFeatureAvailable: (feature: Feature) => boolean;
  getAvailableFeatures: () => Feature[];
}

/**
 * Custom hook for feature detection
 * 
 * @returns Information about the current environment and available features
 */
export const useFeatureDetection = (): FeatureDetectionResult => {
  const isElectron = FeatureDetectionService.isElectron();
  
  return useMemo(() => {
    // Get browser type only if we're in a web environment
    const browserType = isElectron ? null : FeatureDetectionService.getBrowserType();
    
    return {
      // Environment information
      environment: isElectron ? 'electron' : 'web',
      isElectron,
      isWeb: !isElectron,
      browserType,
      
      // Feature availability
      canAccessFileSystem: FeatureDetectionService.isFeatureAvailable(Feature.FILE_SYSTEM_ACCESS),
      canUseFileSaveDialog: FeatureDetectionService.isFeatureAvailable(Feature.FILE_SAVE_DIALOG),
      canUseFileOpenDialog: FeatureDetectionService.isFeatureAvailable(Feature.FILE_OPEN_DIALOG),
      canDetectSystemTheme: FeatureDetectionService.isFeatureAvailable(Feature.SYSTEM_THEME),
      hasIndexedDB: FeatureDetectionService.isFeatureAvailable(Feature.INDEXED_DB),
      hasLocalStorage: FeatureDetectionService.isFeatureAvailable(Feature.LOCAL_STORAGE),
      
      // Helper methods
      isFeatureAvailable: FeatureDetectionService.isFeatureAvailable,
      getAvailableFeatures: FeatureDetectionService.getAvailableFeatures,
    };
  }, [isElectron]);
};

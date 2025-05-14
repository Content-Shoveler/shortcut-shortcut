/**
 * Feature Detection Service
 * 
 * This service provides methods to detect and handle feature availability
 * across different environments (Electron vs. Web).
 */

import { isElectron } from '../../utils/environment';

/**
 * Enum of features that might not be available in all environments
 */
export enum Feature {
  // File system access
  FILE_SYSTEM_ACCESS = 'fileSystemAccess',
  FILE_SAVE_DIALOG = 'fileSaveDialog',
  FILE_OPEN_DIALOG = 'fileOpenDialog',
  
  // System integration
  SYSTEM_THEME = 'systemTheme',
  
  // Persistence
  INDEXED_DB = 'indexedDB',
  LOCAL_STORAGE = 'localStorage'
}

/**
 * Service for detecting feature availability
 */
export class FeatureDetectionService {
  /**
   * Check if a specific feature is available
   */
  public static isFeatureAvailable(feature: Feature): boolean {
    switch (feature) {
      // File system features
      case Feature.FILE_SYSTEM_ACCESS:
        return isElectron() || 'showOpenFilePicker' in window;
        
      case Feature.FILE_SAVE_DIALOG:
        return isElectron() || 'showSaveFilePicker' in window;
        
      case Feature.FILE_OPEN_DIALOG:
        return isElectron() || 'showOpenFilePicker' in window;
      
      // System integration features
      case Feature.SYSTEM_THEME:
        return window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all';
        
      // Persistence features
      case Feature.INDEXED_DB:
        return 'indexedDB' in window;
        
      case Feature.LOCAL_STORAGE:
        return 'localStorage' in window;
        
      // Default fallback
      default:
        return false;
    }
  }

  /**
   * Get all available features
   */
  public static getAvailableFeatures(): Feature[] {
    return Object.values(Feature).filter(feature => 
      this.isFeatureAvailable(feature as Feature)
    ) as Feature[];
  }

  /**
   * Check if running in Electron
   */
  public static isElectron(): boolean {
    return isElectron();
  }

  /**
   * Check if running in a web browser
   */
  public static isBrowser(): boolean {
    return !isElectron();
  }

  /**
   * Detect browser type (for web-specific optimizations)
   */
  public static getBrowserType(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'other' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      return 'chrome';
    } else if (userAgent.includes('firefox')) {
      return 'firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari';
    } else if (userAgent.includes('edge')) {
      return 'edge';
    } else {
      return 'other';
    }
  }
}

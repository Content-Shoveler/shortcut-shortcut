/**
 * Settings Storage Service
 * 
 * This service provides methods for managing application settings
 * using the underlying storage abstraction.
 */

import { StorageService, createStorageService } from './StorageService';

// Define the settings structure
export interface AppSettings {
  apiToken: string;
  startupPage: 'home' | 'last-viewed';
  confirmDialogs: {
    deleteTemplate: boolean;
    applyTemplate: boolean;
  };
  appearance: {
    density: 'comfortable' | 'compact';
    fontSize: 'small' | 'medium' | 'large';
    viewMode: 'card' | 'list';
  };
}

// Default settings
export const defaultSettings: AppSettings = {
  apiToken: '',
  startupPage: 'home',
  confirmDialogs: {
    deleteTemplate: true,
    applyTemplate: true,
  },
  appearance: {
    density: 'comfortable',
    fontSize: 'medium',
    viewMode: 'card',
  },
};

// Settings storage key
const SETTINGS_KEY = 'appSettings';

/**
 * Service for managing application settings
 */
export class SettingsStorage {
  private storage: StorageService;
  
  constructor() {
    this.storage = createStorageService();
    this.initializeSettings();
  }
  
  /**
   * Initialize settings by loading from storage or migrating from localStorage
   */
  private async initializeSettings(): Promise<void> {
    try {
      // First check if settings already exist in our storage
      const hasSettings = await this.storage.has(SETTINGS_KEY);
      
      if (!hasSettings) {
        // Check if settings exist in localStorage for migration
        const localStorageSettings = localStorage.getItem(SETTINGS_KEY);
        
        if (localStorageSettings) {
          try {
            const parsedSettings = JSON.parse(localStorageSettings);
            await this.storage.set(SETTINGS_KEY, parsedSettings);
            console.log('Migrated settings from localStorage to storage service');
          } catch (parseError) {
            console.error('Error parsing settings from localStorage:', parseError);
            // Use default settings
            await this.storage.set(SETTINGS_KEY, defaultSettings);
          }
        } else {
          // No settings in localStorage, use defaults
          await this.storage.set(SETTINGS_KEY, defaultSettings);
        }
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  }
  
  /**
   * Get all application settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await this.storage.get<AppSettings>(SETTINGS_KEY, defaultSettings);
      return settings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return defaultSettings;
    }
  }
  
  /**
   * Update application settings
   * @param settings New settings to save, or partial settings to merge
   * @param merge Whether to merge with existing settings or replace entirely
   */
  async updateSettings(settings: Partial<AppSettings> | AppSettings, merge = true): Promise<AppSettings> {
    try {
      if (merge) {
        // Get current settings
        const currentSettings = await this.getSettings();
        
        // Merge with new settings (deep merge for nested objects)
        const mergedSettings = this.deepMerge(currentSettings, settings);
        
        // Save merged settings
        await this.storage.set(SETTINGS_KEY, mergedSettings);
        
        return mergedSettings;
      } else {
        // Save settings as-is (assuming complete settings object)
        const fullSettings = settings as AppSettings;
        await this.storage.set(SETTINGS_KEY, fullSettings);
        
        return fullSettings;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return await this.getSettings();
    }
  }
  
  /**
   * Update just the API token
   * @param token New API token
   */
  async updateApiToken(token: string): Promise<AppSettings> {
    return this.updateSettings({ apiToken: token });
  }
  
  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<AppSettings> {
    try {
      await this.storage.set(SETTINGS_KEY, defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return await this.getSettings();
    }
  }
  
  /**
   * Helper method to deep merge objects
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        const sourceValue = source[key as keyof typeof source];
        if (isObject(sourceValue)) {
          if (!(key in target)) {
            Object.assign(output, { [key]: sourceValue });
          } else {
            (output as any)[key] = this.deepMerge(
              (target as any)[key],
              sourceValue as any
            );
          }
        } else {
          Object.assign(output, { [key]: sourceValue });
        }
      });
    }
    
    return output;
  }
}

/**
 * Type guard to check if a value is an object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Create a singleton instance of the SettingsStorage
 */
export const settingsStorage = new SettingsStorage();

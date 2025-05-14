/**
 * Electron implementation of the Storage Service
 * 
 * This implementation uses Electron IPC to interact with electron-store
 * in the main process.
 */

import { StorageService } from './StorageService';
import { getElectronAPI } from '../../utils/environment';

/**
 * Implementation of the Storage Service for Electron environment
 * This wraps the existing electron-store functionality via IPC
 */
export class ElectronStorageService implements StorageService {
  private getAPI() {
    const api = getElectronAPI();
    if (!api) {
      throw new Error('Electron API is not available');
    }
    return api;
  }

  /**
   * Get a value from electron-store
   */
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const api = this.getAPI();
      // For now, we're directly using the existing IPC methods
      // In the future, we might want to create specific methods for the storage service
      const result = await api.getTemplates();
      
      if (key === 'templates') {
        return result as unknown as T;
      }
      
      // For other keys, we'll need to add more IPC methods or a generic one
      return defaultValue as T;
    } catch (error) {
      console.error(`Error getting value for key ${key}:`, error);
      return defaultValue as T;
    }
  }

  /**
   * Set a value in electron-store
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const api = this.getAPI();
      
      if (key === 'templates' && Array.isArray(value)) {
        // For templates, use the existing saveTemplate method for each template
        for (const template of value) {
          await api.saveTemplate(template);
        }
        return;
      }
      
      // For other keys, we'll need to add more IPC methods or a generic one
      throw new Error(`Setting value for key ${key} is not implemented yet`);
    } catch (error) {
      console.error(`Error setting value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in electron-store
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== undefined;
    } catch (error) {
      console.error(`Error checking if key ${key} exists:`, error);
      return false;
    }
  }

  /**
   * Delete a value from electron-store
   */
  async delete(key: string): Promise<void> {
    try {
      const api = this.getAPI();
      
      if (key === 'templates') {
        // For templates, there's no direct way to delete all templates
        // We would need to add a new IPC method for this
        throw new Error('Deleting all templates is not implemented yet');
      } else if (key.startsWith('template:')) {
        // If it's a specific template ID
        const templateId = key.substring('template:'.length);
        await api.deleteTemplate(templateId);
        return;
      }
      
      // For other keys, we'll need to add more IPC methods or a generic one
      throw new Error(`Deleting value for key ${key} is not implemented yet`);
    } catch (error) {
      console.error(`Error deleting value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all values from electron-store
   */
  async clear(): Promise<void> {
    // We would need to add a new IPC method for this
    throw new Error('Clearing all values is not implemented yet');
  }

  /**
   * Get all key-value pairs from electron-store
   */
  async getAll(): Promise<Record<string, any>> {
    try {
      const templates = await this.get('templates', []);
      
      // For now, we only have templates
      return { templates };
    } catch (error) {
      console.error('Error getting all values:', error);
      return {};
    }
  }
}

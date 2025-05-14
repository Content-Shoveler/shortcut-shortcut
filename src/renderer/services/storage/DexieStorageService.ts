/**
 * Web implementation of the Storage Service
 * 
 * This implementation uses Dexie.js to interact with IndexedDB
 * in the browser environment.
 */

import Dexie from 'dexie';
import { StorageService } from './StorageService';
import { Template } from '../../types';

/**
 * Define the database schema for IndexedDB
 */
class ShortcutShortcutDB extends Dexie {
  // Define tables
  templates!: Dexie.Table<Template, string>;
  keyValueStore!: Dexie.Table<{ key: string; value: any }, string>;

  constructor() {
    super('ShortcutShortcutDB');
    
    // Define schema with version history for migrations
    this.version(1).stores({
      templates: 'id, name', // Primary key is id, index on name
      keyValueStore: 'key' // Primary key is key
    });
  }
}

/**
 * Implementation of the Storage Service for web environment
 * Uses Dexie.js to interact with IndexedDB
 */
export class DexieStorageService implements StorageService {
  private db: ShortcutShortcutDB;
  
  constructor() {
    this.db = new ShortcutShortcutDB();
    this.initializeDB();
  }
  
  /**
   * Initialize the database and perform any migrations
   * from localStorage if needed
   */
  private async initializeDB(): Promise<void> {
    try {
      // Check if we have templates in localStorage that need to be migrated
      const localStorageTemplates = localStorage.getItem('templates');
      if (localStorageTemplates) {
        // Parse the templates from localStorage
        const templates = JSON.parse(localStorageTemplates);
        
        // Check if we already have templates in IndexedDB
        const count = await this.db.templates.count();
        
        // Only migrate if IndexedDB is empty
        if (count === 0 && Array.isArray(templates) && templates.length > 0) {
          console.log('Migrating templates from localStorage to IndexedDB...');
          
          // Bulk add the templates to IndexedDB
          await this.db.templates.bulkAdd(templates);
          
          console.log(`Migrated ${templates.length} templates to IndexedDB`);
          
          // Optionally clear localStorage to avoid confusion
          // localStorage.removeItem('templates');
        }
      }
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  /**
   * Get a value from IndexedDB
   */
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      // Handle special keys
      if (key === 'templates') {
        const templates = await this.db.templates.toArray();
        return templates as unknown as T;
      }
      
      // For other keys, check the keyValueStore
      const entry = await this.db.keyValueStore.get(key);
      
      if (entry) {
        return entry.value as T;
      }
      
      return defaultValue as T;
    } catch (error) {
      console.error(`Error getting value for key ${key}:`, error);
      return defaultValue as T;
    }
  }

  /**
   * Set a value in IndexedDB
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      // Handle special keys
      if (key === 'templates' && Array.isArray(value)) {
        // Clear existing templates
        await this.db.templates.clear();
        
        // Add new templates
        if (value.length > 0) {
          await this.db.templates.bulkAdd(value as unknown as Template[]);
        }
        
        return;
      }
      
      // For other keys, store in keyValueStore
      await this.db.keyValueStore.put({ key, value });
    } catch (error) {
      console.error(`Error setting value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in IndexedDB
   */
  async has(key: string): Promise<boolean> {
    try {
      // Handle special keys
      if (key === 'templates') {
        const count = await this.db.templates.count();
        return count > 0;
      }
      
      // For other keys, check the keyValueStore
      const count = await this.db.keyValueStore.where('key').equals(key).count();
      return count > 0;
    } catch (error) {
      console.error(`Error checking if key ${key} exists:`, error);
      return false;
    }
  }

  /**
   * Delete a value from IndexedDB
   */
  async delete(key: string): Promise<void> {
    try {
      // Handle special keys
      if (key === 'templates') {
        await this.db.templates.clear();
        return;
      } else if (key.startsWith('template:')) {
        // If it's a specific template ID
        const templateId = key.substring('template:'.length);
        await this.db.templates.delete(templateId);
        return;
      }
      
      // For other keys, delete from keyValueStore
      await this.db.keyValueStore.delete(key);
    } catch (error) {
      console.error(`Error deleting value for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all values from IndexedDB
   */
  async clear(): Promise<void> {
    try {
      // Clear all tables
      await this.db.templates.clear();
      await this.db.keyValueStore.clear();
    } catch (error) {
      console.error('Error clearing all values:', error);
      throw error;
    }
  }

  /**
   * Get all key-value pairs from IndexedDB
   */
  async getAll(): Promise<Record<string, any>> {
    try {
      // Get templates
      const templates = await this.db.templates.toArray();
      
      // Get key-value pairs
      const keyValueEntries = await this.db.keyValueStore.toArray();
      
      // Combine into a single object
      const result: Record<string, any> = { templates };
      
      // Add key-value pairs
      for (const entry of keyValueEntries) {
        result[entry.key] = entry.value;
      }
      
      return result;
    } catch (error) {
      console.error('Error getting all values:', error);
      return {};
    }
  }
}

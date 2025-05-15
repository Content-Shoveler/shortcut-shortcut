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
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  
  constructor() {
    console.log('Creating DexieStorageService instance');
    try {
      this.db = new ShortcutShortcutDB();
      console.log('ShortcutShortcutDB instance created successfully');
      // Initialize DB when constructing the service
      this.initializationPromise = this.initializeDB();
    } catch (error) {
      console.error('Error creating Dexie database instance:', error);
      // Create a new instance anyway so the app doesn't crash
      console.warn('Creating empty database instance as fallback');
      this.db = new ShortcutShortcutDB();
      this.initializationPromise = Promise.resolve();
    }
  }
  
  /**
   * Initialize the database and perform any migrations
   * from localStorage if needed
   */
  private async initializeDB(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    console.log('Initializing IndexedDB database...');
    
    try {
      // First ensure the database is open and schema is ready
      await this.db.open();
      console.log('Database opened successfully');
      
      // Check if we have templates in localStorage that need to be migrated
      const localStorageTemplates = localStorage.getItem('templates');
      if (localStorageTemplates) {
        try {
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
        } catch (parseError) {
          console.error('Error parsing localStorage templates:', parseError);
        }
      }
      
      // Check if we have settings in localStorage that need to be migrated
      const localStorageSettings = localStorage.getItem('appSettings');
      if (localStorageSettings) {
        try {
          const settings = JSON.parse(localStorageSettings);
          
          // Store settings in the keyValueStore if valid
          if (settings && typeof settings === 'object') {
            console.log('Migrating settings from localStorage to IndexedDB...');
            await this.db.keyValueStore.put({ key: 'appSettings', value: settings });
            console.log('Settings migration completed');
          }
        } catch (parseError) {
          console.error('Error parsing localStorage settings:', parseError);
        }
      }
      
      // Mark initialization as complete
      this.isInitialized = true;
      console.log('IndexedDB initialization completed successfully');
      
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
      // Don't mark as initialized so we might retry later
    }
  }
  
  /**
   * Ensure database is initialized before performing operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      if (this.initializationPromise) {
        await this.initializationPromise;
      } else {
        this.initializationPromise = this.initializeDB();
        await this.initializationPromise;
      }
    }
  }

  /**
   * Get a value from IndexedDB
   */
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      // Ensure the database is initialized
      await this.ensureInitialized();
      
      // Handle special keys
      if (key === 'templates') {
        const templates = await this.db.templates.toArray();
        console.log(`Retrieved ${templates.length} templates from IndexedDB`);
        return templates as unknown as T;
      }
      
      // For other keys, check the keyValueStore
      const entry = await this.db.keyValueStore.get(key);
      
      if (entry) {
        console.log(`Retrieved value for key '${key}' from IndexedDB`);
        return entry.value as T;
      }
      
      console.log(`No value found for key '${key}', using default value`);
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
    console.log(`[Storage Debug] Setting ${key}:`, value);
    
    try {
      // Ensure the database is initialized
      await this.ensureInitialized();
      
      // Special case for templates
      if (key === 'templates' && Array.isArray(value)) {
        try {
          await this.db.transaction('rw', this.db.templates, async () => {
            console.log('Clearing existing templates...');
            await this.db.templates.clear();
            
            if (value.length > 0) {
              console.log(`Adding ${value.length} new templates...`);
              await this.db.templates.bulkAdd(value as unknown as Template[]);
            }
          });
          
          console.log('Template update successful');
          
          // Also save to localStorage as backup
          try {
            localStorage.setItem('templates', JSON.stringify(value));
          } catch (localStorageError) {
            console.warn('Failed to backup templates to localStorage:', localStorageError);
          }
          
          return;
        } catch (transactionError) {
          console.error('Transaction error when updating templates:', transactionError);
          throw transactionError;
        }
      }
      
      // For other keys
      console.log(`Updating key-value for ${key}`);
      try {
        await this.db.keyValueStore.put({ key, value });
        console.log(`Successfully updated ${key}`);
        
        // For important keys, also save to localStorage as backup
        if (key === 'appSettings') {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (localStorageError) {
            console.warn(`Failed to backup ${key} to localStorage:`, localStorageError);
          }
        }
        
      } catch (putError) {
        console.error(`Error putting value in keyValueStore for key ${key}:`, putError);
        throw putError;
      }
    } catch (error) {
      console.error(`[Storage Error] Failed to set ${key}:`, error);
      
      // As last resort, try using localStorage directly
      try {
        console.warn(`Attempting to save ${key} to localStorage as fallback...`);
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`Saved ${key} to localStorage fallback`);
      } catch (fallbackError) {
        console.error('Fallback storage also failed:', fallbackError);
      }
      
      throw error;
    }
  }

  /**
   * Check if a key exists in IndexedDB
   */
  async has(key: string): Promise<boolean> {
    try {
      // Ensure the database is initialized
      await this.ensureInitialized();
      
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
      
      // Try localStorage as fallback
      if (key === 'templates' || key === 'appSettings') {
        return localStorage.getItem(key) !== null;
      }
      
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

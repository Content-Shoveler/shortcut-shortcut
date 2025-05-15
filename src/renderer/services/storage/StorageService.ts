/**
 * Storage Service Interface
 * 
 * This file defines the interface for storage operations and
 * provides a factory function to create the appropriate implementation
 * based on the current environment.
 */

import { isElectron } from '../../utils/environment';

/**
 * Interface for all storage operations
 */
export interface StorageService {
  /**
   * Get a value from storage
   * @param key The key to retrieve
   * @param defaultValue Optional default value if key doesn't exist
   * @returns The stored value or defaultValue if not found
   */
  get<T>(key: string, defaultValue?: T): Promise<T>;

  /**
   * Set a value in storage
   * @param key The key to store
   * @param value The value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Check if a key exists in storage
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: string): Promise<boolean>;

  /**
   * Delete a value from storage
   * @param key The key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all values from storage
   */
  clear(): Promise<void>;
  
  /**
   * Get all key-value pairs from storage
   * @returns Object containing all stored key-value pairs
   */
  getAll(): Promise<Record<string, any>>;
}

/**
 * Factory function to create the appropriate storage service implementation
 * based on the current environment.
 */
export const createStorageService = (): StorageService => {
  // Ensure we're making the right detection
  const isElectronEnv = isElectron();
  console.log('Creating storage service for environment:', {
    isElectron: isElectronEnv,
    isWeb: !isElectronEnv
  });
  
  try {
    // Dynamic imports to avoid loading unnecessary code
    if (isElectronEnv) {
      // Using require here to avoid webpack trying to include both implementations
      // in the bundle when only one is needed
      console.log('Loading ElectronStorageService...');
      const { ElectronStorageService } = require('./ElectronStorageService');
      return new ElectronStorageService();
    } else {
      console.log('Loading DexieStorageService...');
      const { DexieStorageService } = require('./DexieStorageService');
      
      // Create and initialize the DexieStorageService
      const dexieStorage = new DexieStorageService();
      
      // Log successful initialization
      console.log('DexieStorageService initialized successfully');
      return dexieStorage;
    }
  } catch (error) {
    console.error('Error creating storage service:', error);
    
    // Fallback to Dexie in case of errors with the primary choice
    // This is a last resort to avoid breaking the app
    try {
      console.log('Attempting to use DexieStorageService as fallback...');
      const { DexieStorageService } = require('./DexieStorageService');
      return new DexieStorageService();
    } catch (fallbackError) {
      console.error('Fatal error: Failed to create storage service:', fallbackError);
      
      // Create an in-memory fallback storage as a last resort
      // This will not persist data but will at least prevent crashes
      console.warn('Using in-memory fallback storage. Data will not persist!');
      return createInMemoryStorageFallback();
    }
  }
};

/**
 * Creates a simple in-memory storage implementation as a last resort fallback
 * if both primary storage implementations fail.
 */
function createInMemoryStorageFallback(): StorageService {
  const memoryStore: Record<string, any> = {};
  
  const storage: StorageService = {
    async get<T>(key: string, defaultValue?: T): Promise<T> {
      return key in memoryStore ? memoryStore[key] : (defaultValue as T);
    },
    
    async set<T>(key: string, value: T): Promise<void> {
      memoryStore[key] = value;
    },
    
    async has(key: string): Promise<boolean> {
      return key in memoryStore;
    },
    
    async delete(key: string): Promise<void> {
      delete memoryStore[key];
    },
    
    async clear(): Promise<void> {
      Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
    },
    
    async getAll(): Promise<Record<string, any>> {
      return { ...memoryStore };
    }
  };
  
  return storage;
}

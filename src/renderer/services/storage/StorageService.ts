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
  // Dynamic imports to avoid loading unnecessary code
  if (isElectron()) {
    // Using require here to avoid webpack trying to include both implementations
    // in the bundle when only one is needed
    const { ElectronStorageService } = require('./ElectronStorageService');
    return new ElectronStorageService();
  } else {
    const { DexieStorageService } = require('./DexieStorageService');
    return new DexieStorageService();
  }
};

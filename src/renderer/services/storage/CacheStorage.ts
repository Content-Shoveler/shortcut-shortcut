/**
 * Cache Storage Service
 * 
 * This service provides methods for managing the application cache
 * using the underlying storage abstraction.
 */

import { StorageService, createStorageService } from './StorageService';

// Define the shape of a cache entry
export interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Cache storage keys
const CACHE_KEY_PREFIX = 'cache:';

/**
 * Service for managing cache entries
 */
export class CacheStorage {
  private storage: StorageService;
  
  // In-memory cache for faster access
  private memoryCache: Map<string, CacheEntry> = new Map();
  
  constructor() {
    this.storage = createStorageService();
    this.initializeCache();
  }
  
  /**
   * Initialize the cache by loading existing entries
   */
  private async initializeCache(): Promise<void> {
    try {
      // Load all cache entries from storage
      const allEntries = await this.storage.getAll();
      
      // Filter for cache entries and add to memory cache
      for (const [key, value] of Object.entries(allEntries)) {
        if (key.startsWith(CACHE_KEY_PREFIX) && this.isValidCacheEntry(value)) {
          const cacheKey = key.substring(CACHE_KEY_PREFIX.length);
          
          // Only add if not expired
          if (Date.now() <= value.expiresAt) {
            this.memoryCache.set(cacheKey, value);
          } else {
            // Delete expired entries
            await this.storage.delete(key);
          }
        }
      }
      
      console.log(`Loaded ${this.memoryCache.size} cache entries from storage`);
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }
  
  /**
   * Type guard to check if a value is a valid cache entry
   */
  private isValidCacheEntry(value: any): value is CacheEntry {
    return (
      value &&
      typeof value === 'object' &&
      'data' in value &&
      'timestamp' in value &&
      'expiresAt' in value &&
      typeof value.timestamp === 'number' &&
      typeof value.expiresAt === 'number'
    );
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or null if not found or expired
   */
  async getCache(key: string): Promise<any | null> {
    if (!key) return null;

    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry) {
        // Check if the cache entry has expired
        if (Date.now() > memoryEntry.expiresAt) {
          // Remove expired entry
          this.memoryCache.delete(key);
          await this.storage.delete(`${CACHE_KEY_PREFIX}${key}`);
          return null;
        }
        
        return memoryEntry.data;
      }
      
      // If not in memory, check persistent storage
      const storageKey = `${CACHE_KEY_PREFIX}${key}`;
      const entry = await this.storage.get<CacheEntry | null>(storageKey, null);
      
      if (!entry) return null;
      
      // Check if the cache entry has expired
      if (Date.now() > entry.expiresAt) {
        // Remove expired entry
        await this.storage.delete(storageKey);
        return null;
      }
      
      // Add to memory cache
      this.memoryCache.set(key, entry);
      
      return entry.data;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Set a value in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds
   */
  async setCache(key: string, data: any, ttl: number): Promise<void> {
    if (!key) return;
    
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };
      
      // Update memory cache
      this.memoryCache.set(key, entry);
      
      // Update persistent cache
      const storageKey = `${CACHE_KEY_PREFIX}${key}`;
      await this.storage.set(storageKey, entry);
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
    }
  }
  
  /**
   * Invalidate cache entries that match a key pattern
   * @param keyPattern Pattern to match cache keys against
   */
  async invalidateCache(keyPattern?: string): Promise<void> {
    if (!keyPattern) return;
    
    try {
      // Delete from memory cache
      for (const key of this.memoryCache.keys()) {
        if (key.includes(keyPattern)) {
          this.memoryCache.delete(key);
        }
      }
      
      // Get all keys from storage
      const allEntries = await this.storage.getAll();
      
      // Delete matching cache entries from storage
      for (const key of Object.keys(allEntries)) {
        if (key.startsWith(CACHE_KEY_PREFIX) && 
            key.substring(CACHE_KEY_PREFIX.length).includes(keyPattern)) {
          await this.storage.delete(key);
        }
      }
    } catch (error) {
      console.error(`Error invalidating cache for pattern ${keyPattern}:`, error);
    }
  }
  
  /**
   * Clear the entire cache
   */
  async clearCache(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      
      // Get all keys from storage
      const allEntries = await this.storage.getAll();
      
      // Delete all cache entries from storage
      for (const key of Object.keys(allEntries)) {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          await this.storage.delete(key);
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
  
  /**
   * Get all current cache keys
   */
  getCacheKeys(): string[] {
    return Array.from(this.memoryCache.keys());
  }
}

/**
 * Create a singleton instance of the CacheStorage
 */
export const cacheStorage = new CacheStorage();

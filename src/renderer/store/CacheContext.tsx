import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { cacheStorage } from '../services/storage/CacheStorage';

// Define the shape of a cache entry
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Interface for the cache context
interface CacheContextType {
  getCache: (key: string) => any | null;
  setCache: (key: string, data: any, ttl?: number) => void;
  invalidateCache: (keyPattern?: string) => void;
  clearCache: () => void;
  getCacheKeys: () => string[];
}

// Default TTL values (in milliseconds)
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const STATIC_DATA_TTL = 30 * 60 * 1000; // 30 minutes
const DYNAMIC_DATA_TTL = 2 * 60 * 1000; // 2 minutes

// Create the context with default values
const CacheContext = createContext<CacheContextType>({
  getCache: () => null,
  setCache: () => {},
  invalidateCache: () => {},
  clearCache: () => {},
  getCacheKeys: () => [],
});

// Hook for using the cache context
export const useCache = () => useContext(CacheContext);

// The TTL configuration based on endpoint patterns
const getTtlForKey = (key: string): number => {
  // More static data types
  if (key.includes('projects') || 
      key.includes('workflows') || 
      key.includes('epic-workflow') || 
      key.includes('members')) {
    return STATIC_DATA_TTL;
  }
  
  // More dynamic data types
  if (key.includes('iterations') || 
      key.includes('states') || 
      key.includes('labels')) {
    return DYNAMIC_DATA_TTL;
  }
  
  // Default TTL for everything else
  return DEFAULT_TTL;
};

// The CacheProvider component
interface CacheProviderProps {
  children: ReactNode;
}

export const CacheProvider: React.FC<CacheProviderProps> = ({ children }) => {
  // Add initialization and loading state
  const [isInitialized, setIsInitialized] = useState(false);
  const [memoryCache] = useState<Map<string, CacheEntry>>(new Map());
  
  // Load cache from storage on mount
  useEffect(() => {
    const initializeCache = async () => {
      try {
        // Load cached items from persistent storage
        // Get all cache keys and retrieve each cache entry individually
        const cacheKeys = cacheStorage.getCacheKeys();
        const storedCache = new Map<string, CacheEntry>();
        
        // Get each cache entry individually
        for (const key of cacheKeys) {
          const entry = await cacheStorage.getCache(key);
          if (entry) {
            storedCache.set(key, {
              data: entry,
              timestamp: Date.now(),
              expiresAt: Date.now() + getTtlForKey(key)
            });
          }
        }
        
        // Populate memory cache with stored items
        storedCache.forEach((entry, key) => {
          memoryCache.set(key, entry);
        });
        
        console.log('Cache initialized with', memoryCache.size, 'entries');
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing cache:', error);
        setIsInitialized(true); // Continue anyway
      }
    };
    
    initializeCache();
  }, [memoryCache]);
  
  // Get data from cache if it exists and hasn't expired
  const getCache = useCallback((key: string): any | null => {
    if (!key) return null;

    const entry = memoryCache.get(key);
    if (!entry) return null;

    // Check if the cache entry has expired
    if (Date.now() > entry.expiresAt) {
      // Remove expired entry
      memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }, [memoryCache]);

  // Store data in the cache with a TTL
  const setCache = useCallback((key: string, data: any, customTtl?: number): void => {
    if (!key) return;
    
    // Calculate TTL based on the key or use custom TTL if provided
    const ttl = customTtl || getTtlForKey(key);
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    // Update memory cache
    memoryCache.set(key, entry);
    
    // Update persistent cache asynchronously
    cacheStorage.setCache(key, entry, ttl)
      .catch((error: Error) => console.error('Failed to persist cache entry:', error));
  }, [memoryCache]);

  // Invalidate cache entries that match a key pattern
  const invalidateCache = useCallback((keyPattern?: string): void => {
    if (!keyPattern) return; // If no pattern provided, do nothing
    
    // Delete all keys that include the pattern
    for (const key of memoryCache.keys()) {
      if (key.includes(keyPattern)) {
        memoryCache.delete(key);
      }
    }
  }, [memoryCache]);

  // Clear the entire cache
  const clearCache = useCallback((): void => {
    memoryCache.clear();
  }, [memoryCache]);

  // Get all current cache keys (useful for debugging)
  const getCacheKeys = useCallback((): string[] => {
    return Array.from(memoryCache.keys());
  }, [memoryCache]);

  // Don't render children until initialization completes
  if (!isInitialized) {
    return <div>Initializing cache...</div>; // Or a better loading indicator
  }

  return (
    <CacheContext.Provider 
      value={{ 
        getCache, 
        setCache, 
        invalidateCache, 
        clearCache, 
        getCacheKeys 
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

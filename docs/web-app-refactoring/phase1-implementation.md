# Shortcut-Shortcut Web App Refactoring - Phase 1 Implementation

This document details the implementation of Phase 1 of the web app refactoring plan, which focused on Environment Detection & API Abstraction.

## Implemented Files

1. **Environment Detection Utility**
   - `src/renderer/utils/environment.ts` - Provides utility functions for detecting the current runtime environment

2. **API Service Interface**
   - `src/renderer/services/api/ShortcutApiService.ts` - Defines the common interface for API operations

3. **Electron API Implementation**
   - `src/renderer/services/api/ElectronShortcutApiService.ts` - Implements API service for Electron environment

4. **Web API Implementation**
   - `src/renderer/services/api/WebShortcutApiService.ts` - Implements API service for Web environment

5. **Updated API Hook**
   - `src/renderer/hooks/useShortcutApi.ts.new` - Updated version of the API hook that uses the new abstraction layer

## Implementation Details

### Environment Detection

We've implemented a simple utility for detecting whether the app is running in Electron or web environment:

```typescript
// src/renderer/utils/environment.ts
export const isElectron = (): boolean => {
  return window.electronAPI !== undefined;
};

export const getEnvironment = () => ({
  isElectron: isElectron(),
  isWeb: !isElectron(),
});

export const getElectronAPI = () => {
  if (isElectron()) {
    return window.electronAPI;
  }
  return undefined;
};
```

This provides a single source of truth for environment detection throughout the application.

### API Service Interface

We've defined a common interface for all Shortcut API operations:

```typescript
// src/renderer/services/api/ShortcutApiService.ts
export interface ShortcutApiService {
  validateToken: (apiToken: string) => Promise<boolean>;
  fetchProjects: (apiToken: string) => Promise<ShortcutProject[]>;
  // ... other API methods
}
```

The interface includes all methods needed for interacting with the Shortcut API, ensuring consistent behavior across environments.

### Environment-Specific Implementations

1. **Electron Implementation**
   - Uses the existing Electron IPC bridge to communicate with the main process
   - Main process handles the actual API calls to avoid CORS issues
   - Wraps the existing implementation to match the new interface

2. **Web Implementation**
   - Makes direct API calls to the Shortcut API using the fetch API
   - Handles authentication via API token headers
   - Implements proper error handling and response parsing

### Factory Function

The API service interface includes a factory function that returns the appropriate implementation based on the current environment:

```typescript
export const createShortcutApiService = (): ShortcutApiService => {
  if (isElectron()) {
    const { ElectronShortcutApiService } = require('./ElectronShortcutApiService');
    return new ElectronShortcutApiService();
  } else {
    const { WebShortcutApiService } = require('./WebShortcutApiService');
    return new WebShortcutApiService();
  }
};
```

This allows the application to use the same API interface regardless of environment.

### Updated API Hook

We've updated the `useShortcutApi` hook to use our new abstraction layer:

1. It now uses `createShortcutApiService()` to get the appropriate implementation
2. All API calls are made through the service interface
3. Caching logic remains the same, ensuring consistent performance

## Next Steps for Phase 2

The next phase will focus on implementing the Storage Abstraction layer:

1. **Define Storage Service Interface**
   - Similar to the API service, create an interface for storage operations
   - Should support operations like get, set, delete, and clear
   - Include type-safe implementations

2. **Implement Electron Storage Adapter**
   - Wrap the existing electron-store implementation to match the interface
   - Ensure compatability with existing usage patterns

3. **Implement IndexedDB/LocalStorage Adapter**
   - Use Dexie.js for IndexedDB access
   - Implement schema definition for templates and other data
   - Ensure proper migration handling for future updates

4. **Update Template Storage Logic**
   - Modify the existing template storage to use the new abstraction
   - Ensure existing features still work with the new storage layer

5. **Update CacheContext**
   - Adapt the existing cache implementation to use the storage abstraction
   - Ensure consistent caching behavior across environments

## Integration Strategy

When implementing Phase 2, consider the following:

1. Start by creating the storage interface and implementations before modifying existing code
2. Use the same factory pattern approach for environment-specific implementations
3. Update the electron-store usage gradually to avoid breaking existing functionality
4. Test thoroughly in both environments to ensure consistent behavior

## Notes for Future Development

1. **File Access Limitations**
   - Web environments don't have direct file system access
   - Import/Export functionality will need web-specific implementations using browser file APIs

2. **Authentication Differences**
   - Electron can store API tokens securely in the system's keychain (though not currently implemented)
   - Web will need to rely on localStorage or sessionStorage, with appropriate security warnings

3. **Deployment Considerations**
   - The web version will need appropriate hosting (e.g., Render, Netlify, Vercel)
   - Environment-specific configuration should be handled at build time

/**
 * Initialize API Client
 * 
 * This module is imported early in the application lifecycle to ensure
 * the API client is initialized with the correct token before any
 * components render.
 */
import shortcutApiClient, { getApiToken, API_TOKEN_STORAGE_KEY } from './shortcutApiClient';

/**
 * Initialize the API client with the token from localStorage
 * This ensures the token is available immediately on app start
 * even before the IndexedDB settings are loaded
 */
export function initializeApiClient(): void {
  try {
    // Check if we already have a token in memory
    const currentToken = getApiToken();
    if (currentToken) {
      return;
    }
    
    // Try to get token from localStorage
    const storedToken = localStorage.getItem(API_TOKEN_STORAGE_KEY);
    if (storedToken) {
      shortcutApiClient.setApiToken(storedToken);
    }
  } catch (error) {
    console.error('Error initializing API client:', error);
  }
}

// Run initialization immediately
initializeApiClient();

export default shortcutApiClient;

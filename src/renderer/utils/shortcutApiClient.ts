/**
 * Shortcut API Client
 * 
 * This file provides an Axios-based client for interacting with the Shortcut API.
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ShortcutApiError } from '../types/shortcutApi';

// Base API URL for Shortcut
const API_BASE_URL = 'https://api.app.shortcut.com/api/v3';

/**
 * Creates and configures an Axios client for Shortcut API
 */
export const createShortcutClient = (apiToken: string): AxiosInstance => {
  // Create a new Axios instance with default configuration
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Shortcut-Token': apiToken
    }
  });

  // Add request interceptor for logging API requests
  client.interceptors.request.use(
    (config) => {
      console.log(`🚀 Shortcut API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.log('⚠️ Shortcut API Request Error:', error.message);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  // Define the shape of the expected error response from Shortcut API
  interface ShortcutErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
  }

  client.interceptors.response.use(
    (response) => {
      console.log(`✅ Shortcut API Response: ${response.status} ${response.statusText}`, 
        response.config.url);
      return response;
    },
    (error: AxiosError<ShortcutErrorResponse>) => {
      const apiError: ShortcutApiError = {
        message: 'An unknown error occurred'
      };

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        apiError.message = error.response.data?.message || 
          `API Error: ${error.response.status} ${error.response.statusText}`;
        apiError.code = error.response.status.toString();
        if (error.response.data?.errors) {
          apiError.errors = error.response.data.errors;
        }
      } else if (error.request) {
        // The request was made but no response was received
        apiError.message = 'No response received from Shortcut API';
      } else {
        // Something happened in setting up the request that triggered an Error
        apiError.message = error.message;
      }

      console.log('❌ Shortcut API Error:', apiError.message);
      return Promise.reject(apiError);
    }
  );

  return client;
};

/**
 * Handles API pagination for endpoints that return lists of items
 * @param client Axios client
 * @param url API endpoint
 * @param config Optional axios config
 * @returns Promise resolving to all items from all pages
 */
export const getPaginatedResults = async <T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig
): Promise<T[]> => {
  let allResults: T[] = [];
  let nextToken: string | undefined;
  
  do {
    const requestConfig = { 
      ...config,
      params: {
        ...config?.params,
        ...(nextToken ? { after_id: nextToken } : {})
      }
    };
    
    const response = await client.get<T[]>(url, requestConfig);
    console.log(`📋 Shortcut API Pagination: Retrieved ${response.data.length} items from ${url}`);
    
    // Add this page of results to our collection
    allResults = [...allResults, ...response.data];
    
    // Get the next token from Link header if it exists
    const linkHeader = response.headers.link || response.headers.Link;
    nextToken = undefined;
    
    if (linkHeader) {
      const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (match) {
        const nextUrl = new URL(match[1]);
        nextToken = nextUrl.searchParams.get('after_id') || undefined;
      }
    }
  } while (nextToken);
  
  return allResults;
};

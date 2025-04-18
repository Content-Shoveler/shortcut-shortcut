import { ApolloClient, InMemoryCache } from '@apollo/client';
import { RestLink } from 'apollo-link-rest';
import { getApiToken } from '../utils/electronApi';

// Create the REST link for Shortcut API
const createRestLink = async () => {
  // Get token from electron store
  const token = await getApiToken();
  
  return new RestLink({
    uri: 'https://api.app.shortcut.com/api/v3/',
    customFetch: async (uri, options) => {
      // Refresh token on each request to ensure we have the latest
      const currentToken = await getApiToken();
      
      // Clone options to avoid mutating the original
      const modifiedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Shortcut-Token': currentToken,
          'Content-Type': 'application/json',
        },
      };
      
      return fetch(uri, modifiedOptions);
    },
  });
};

// Create and configure the Apollo Client
export const createApolloClient = async () => {
  const restLink = await createRestLink();
  
  return new ApolloClient({
    link: restLink,
    cache: new InMemoryCache({
      typePolicies: {
        // Define cache key policies for entities
        Project: {
          keyFields: ['id'],
        },
        Epic: {
          keyFields: ['id'],
        },
        Story: {
          keyFields: ['id'],
        },
        Workflow: {
          keyFields: ['id'],
        },
      }
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only', // Don't use the cache by default for queries
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};

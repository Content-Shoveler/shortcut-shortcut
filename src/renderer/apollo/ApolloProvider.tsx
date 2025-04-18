import React, { useEffect, useState } from 'react';
import { ApolloProvider as BaseApolloProvider, ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { createApolloClient } from './client';
import { CyberSpinner } from '../components/cyberpunk';
import { Box, Typography } from '@mui/material';

interface ApolloProviderProps {
  children: React.ReactNode;
}

export const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        const apolloClient = await createApolloClient();
        setClient(apolloClient);
      } catch (err) {
        console.error('Failed to initialize Apollo client', err);
        setError(err as Error);
      }
    };

    initClient();
  }, []);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Failed to initialize API client
        </Typography>
        <Typography variant="body1">
          {error.message}
        </Typography>
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <CyberSpinner size={60} />
      </Box>
    );
  }

  return (
    <BaseApolloProvider client={client}>
      {children}
    </BaseApolloProvider>
  );
};

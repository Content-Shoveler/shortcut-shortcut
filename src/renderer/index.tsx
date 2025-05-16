import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './store/AppProviders';
import App from './App';
import './assets/cyberpunkStyles.css';

// Initialize the API client first to ensure token is loaded
import './utils/initializeClient';

// Initialize the database connection
import './services/dexieService';

const container = document.getElementById('root');
const root = createRoot(container!);

// Render the application
root.render(
  <React.StrictMode>
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  </React.StrictMode>
);

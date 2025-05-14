import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WebAppProviders } from './WebAppProviders';
import App from '../renderer/App';
import '../renderer/assets/cyberpunkStyles.css';

const container = document.getElementById('root');
const root = createRoot(container!);

// Render the application for web
root.render(
  <React.StrictMode>
    <WebAppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WebAppProviders>
  </React.StrictMode>
);

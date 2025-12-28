import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
// import '@mantine/modals/styles.css'; // This import is not needed
import '@mantine/dates/styles.css';

// Suppress WebSocket connection errors from React dev server (HMR) and Apaleo credentials errors
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    const firstArg = args[0];
    const errorMessage = typeof firstArg === 'string' ? firstArg : firstArg?.message ?? '';
    
    if (
      typeof firstArg === 'string' &&
      firstArg.includes('WebSocket connection to') &&
      firstArg.includes('failed')
    ) {
      return;
    }
    
    if (
      errorMessage.includes('not configured with Apaleo credentials') ||
      errorMessage.includes('Property not configured with Apaleo credentials')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring can be added here if needed
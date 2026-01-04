import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

// Suppress WebSocket connection errors from React dev server (HMR) in development
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('WebSocket connection to') &&
      args[0].includes('failed')
    ) {
      return; // Suppress HMR WebSocket errors
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
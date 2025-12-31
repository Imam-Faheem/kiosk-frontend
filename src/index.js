import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
// import '@mantine/modals/styles.css'; // This import is not needed
import '@mantine/dates/styles.css';

// Suppress WebSocket connection errors from React dev server (HMR)
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('WebSocket connection to') &&
      args[0].includes('failed')
    ) {
      // Suppress WebSocket HMR connection errors
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
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
// import '@mantine/modals/styles.css'; // This import is not needed
import '@mantine/dates/styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring can be added here if needed
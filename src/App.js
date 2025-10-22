import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/Layout';
import AppRoutes from './AppRoutes';
import { AppContextProvider } from './contexts/AppContext';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AppContextProvider>
        {showWelcome && <div className="welcome-anim">Welcome to UNO HOTELS</div>}
        <Layout>
          <AppRoutes />
        </Layout>
      </AppContextProvider>
    </Router>     
  );
}

export default App;
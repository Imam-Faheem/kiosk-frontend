import React, { useState, useEffect } from "react";
import AppRoutes from "./AppRoutes";
import { AppContextProvider } from "./contexts/AppContext";
import { ReservationProvider } from "./contexts/ReservationContext";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppContextProvider>
      <ReservationProvider>
        {showWelcome ? (
          <div className="welcome-screen d-flex justify-content-center align-items-center vh-100">
            <h1 className="welcome-text">
              Welcome to <span>UNO HOTELS</span>
            </h1>
          </div>
        ) : (
          <AppRoutes />
        )}
      </ReservationProvider>
    </AppContextProvider>
  );
}

export default App;

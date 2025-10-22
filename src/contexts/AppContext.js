import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [state, setState] = useState({
    language: 'en', // Default language
    guestInfo: {},
    reservationId: null,
    currentStep: 0,
    hardwareStatus: { cashDispenser: true },
  });

  const updateLanguage = (lang) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  const updateGuestInfo = (info) => {
    setState(prev => ({ ...prev, guestInfo: info }));
  };

  const resetState = () => {
    setState({
      language: 'en',
      guestInfo: {},
      reservationId: null,
      currentStep: 0,
      hardwareStatus: { cashDispenser: true },
    });
  };

  return (
    <AppContext.Provider value={{ state, setState, updateLanguage, updateGuestInfo, resetState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
}
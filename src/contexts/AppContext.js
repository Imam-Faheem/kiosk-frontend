import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [state, setState] = useState({
    language: localStorage.getItem("language") || null,
    guestInfo: {},
    reservationId: null,
    currentStep: 0,
    hardwareStatus: { cashDispenser: true },
  });

  const updateLanguage = (lang) => {
    localStorage.setItem("language", lang);
    setState((prev) => ({ ...prev, language: lang }));
  };

  const updateGuestInfo = (info) => setState((prev) => ({ ...prev, guestInfo: info }));

  const resetState = () => {
    localStorage.removeItem("language");
    setState({
      language: null,
      guestInfo: {},
      reservationId: null,
      currentStep: 0,
      hardwareStatus: { cashDispenser: true },
    });
  };

  return (
    <AppContext.Provider
      value={{ state, setState, updateLanguage, updateGuestInfo, resetState }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppContextProvider");
  return context;
}
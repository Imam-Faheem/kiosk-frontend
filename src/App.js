import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import useLanguageStore from "./stores/languageStore";
import usePropertyStore from "./stores/propertyStore";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

function App() {
  const { initializeLanguage } = useLanguageStore();
  const initializeProperty = usePropertyStore((state) => state.initializeProperty);

  useEffect(() => {
    initializeLanguage();
    // Property store auto-initializes from localStorage via Zustand persist
    // This just ensures the store is hydrated
    initializeProperty();
  }, [initializeLanguage, initializeProperty]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

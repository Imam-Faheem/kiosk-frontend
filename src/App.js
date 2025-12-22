import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import useLanguageStore from "./stores/languageStore";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

function App() {
  const { initializeLanguage } = useLanguageStore();

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  // Reserve scrollbar space globally to prevent layout shifts (fallback for older browsers)
  useEffect(() => {
    // Check if scrollbar-gutter is supported (it's already set in index.html CSS)
    const supportsScrollbarGutter = CSS.supports('scrollbar-gutter', 'stable');
    
    // Only apply JavaScript fallback if CSS scrollbar-gutter is not supported
    if (!supportsScrollbarGutter) {
      const calculateScrollbarWidth = () => {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        outer.style.width = '100px';
        document.body.appendChild(outer);
        
        const inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);
        
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        
        outer.parentNode?.removeChild(outer);
        return scrollbarWidth;
      };

      const scrollbarWidth = calculateScrollbarWidth();
      
      // Apply padding to html element to reserve scrollbar space
      if (scrollbarWidth > 0) {
        document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.documentElement.style.paddingRight = '';
      };
    }
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

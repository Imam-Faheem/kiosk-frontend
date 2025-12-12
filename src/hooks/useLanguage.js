import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '../stores/languageStore';

/**
 * Custom hook that ensures components re-render when language changes
 * This hook should be used in all pages that need to respond to language changes
 */
const useLanguage = () => {
  const { t, i18n } = useTranslation();
  const { language, lastUpdated } = useLanguageStore();

  // Force re-render when language changes
  useEffect(() => {
    // This effect will run whenever the language changes
    // The component will re-render and translations will update
  }, [language, lastUpdated]);

  return {
    t,
    language,
    i18n,
  };
};

export default useLanguage;

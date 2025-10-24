import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { APP_CONFIG } from './constants';

// Import translation files
import enTranslation from '../locales/en.json';
import esTranslation from '../locales/es.json';
import frTranslation from '../locales/fr.json';
import deTranslation from '../locales/de.json';
import itTranslation from '../locales/it.json';
import ptTranslation from '../locales/pt.json';

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  fr: { translation: frTranslation },
  de: { translation: deTranslation },
  it: { translation: itTranslation },
  pt: { translation: ptTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: APP_CONFIG.DEFAULT_LANGUAGE,
    supportedLngs: APP_CONFIG.SUPPORTED_LANGUAGES,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

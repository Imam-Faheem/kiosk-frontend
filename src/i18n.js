import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          selectLanguage: "Select Language",
        },
      },
      fr: {
        translation: {
          welcome: "Bienvenue",
          selectLanguage: "Choisir la langue",
        },
      },
      de: {
        translation: {
          welcome: "Willkommen",
          selectLanguage: "Sprache auswählen",
        },
      },
      es: {
        translation: {
          welcome: "Bienvenido",
          selectLanguage: "Seleccionar idioma",
        },
      },
      it: {
        translation: {
          welcome: "Benvenuto",
          selectLanguage: "Seleziona lingua",
        },
      },
      pt: {
        translation: {
          welcome: "Bem-vindo",
          selectLanguage: "Selecionar idioma",
        },
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Define translations
const resources = {
  en: {
    translation: {
      selectLanguage: "Select Language",
      haveReservation: "I Have a Reservation",
      newReservation: "New Reservation",
      lostCard: "I Lost My Room Card",
      welcome: "Welcome to UNO Hotels",
    },
  },
  fr: {
    translation: {
      selectLanguage: "Choisir la langue",
      haveReservation: "J'ai une réservation",
      newReservation: "Nouvelle réservation",
      lostCard: "J'ai perdu ma carte de chambre",
      welcome: "Bienvenue à UNO Hotels",
    },
  },
  de: {
    translation: {
      selectLanguage: "Sprache wählen",
      haveReservation: "Ich habe eine Reservierung",
      newReservation: "Neue Reservierung",
      lostCard: "Ich habe meine Zimmerkarte verloren",
      welcome: "Willkommen bei UNO Hotels",
    },
  },
  es: {
    translation: {
      selectLanguage: "Seleccionar idioma",
      haveReservation: "Tengo una reserva",
      newReservation: "Nueva reserva",
      lostCard: "Perdí mi tarjeta de habitación",
      welcome: "Bienvenido a UNO Hotels",
    },
  },
};

i18n
  .use(LanguageDetector) 
  .use(initReactI18next) 
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

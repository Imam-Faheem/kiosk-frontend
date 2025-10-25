import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../config/i18n';

const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
        // Force a re-render by updating a timestamp
        set({ lastUpdated: Date.now() });
      },
      initializeLanguage: () => {
        const currentLanguage = get().language;
        if (currentLanguage) {
          i18n.changeLanguage(currentLanguage);
        }
      },
      lastUpdated: Date.now(),
    }),
    {
      name: 'language-storage',
    }
  )
);

export default useLanguageStore;

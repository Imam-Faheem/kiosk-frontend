import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../config/i18n';

const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

export default useLanguageStore;

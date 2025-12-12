import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      language: 'en',

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data = await response.json();
          const token = data.user?.ref_tok;

          if (!token) {
            throw new Error('No access token received');
          }

          // Store token in localStorage
          localStorage.setItem('access_token', token);

          set({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: data.user };
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Language management
      updateLanguage: (language) => {
        localStorage.setItem('language', language);
        set({ language });
      },

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem('access_token');
        const language = localStorage.getItem('language') || 'en';
        if (token) {
          set({
            token,
            isAuthenticated: true,
            language,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

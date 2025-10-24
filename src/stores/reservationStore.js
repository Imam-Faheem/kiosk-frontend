import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useReservationStore = create(
  persist(
    (set, get) => ({
      // State
      reservations: [],
      currentReservation: null,
      isLoading: false,
      error: null,
      filters: {
        status: '',
        dateFrom: null,
        dateTo: null,
        guestName: '',
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },

      // Actions
      setReservations: (reservations) => {
        set({ reservations });
      },

      addReservation: (reservation) => {
        set((state) => ({
          reservations: [reservation, ...state.reservations],
        }));
      },

      updateReservation: (id, updates) => {
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id ? { ...reservation, ...updates } : reservation
          ),
        }));
      },

      removeReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.filter((reservation) => reservation.id !== id),
        }));
      },

      setCurrentReservation: (reservation) => {
        set({ currentReservation: reservation });
      },

      clearCurrentReservation: () => {
        set({ currentReservation: null });
      },

      setFilters: (filters) => {
        set({ filters: { ...get().filters, ...filters } });
      },

      clearFilters: () => {
        set({
          filters: {
            status: '',
            dateFrom: null,
            dateTo: null,
            guestName: '',
          },
        });
      },

      setPagination: (pagination) => {
        set({ pagination: { ...get().pagination, ...pagination } });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Reset store
      reset: () => {
        set({
          reservations: [],
          currentReservation: null,
          isLoading: false,
          error: null,
          filters: {
            status: '',
            dateFrom: null,
            dateTo: null,
            guestName: '',
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        });
      },
    }),
    {
      name: 'reservation-storage',
      partialize: (state) => ({
        currentReservation: state.currentReservation,
        filters: state.filters,
      }),
    }
  )
);

export default useReservationStore;

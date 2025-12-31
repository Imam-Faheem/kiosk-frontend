import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const usePropertyStore = create(
  persist(
    (set, get) => ({
      // State
      propertyId: null,
      kioskId: null,
      capabilities: {
        checkIn: true,
        reservations: true,
        cardIssuance: true,
        lostCard: true,
      },
      isConfigured: false,
      configuredAt: null,
      selectedProperty: null, // Store full property object
      _hasHydrated: false, // Internal flag for hydration

      // Actions
      setProperty: (propertyId, propertyData = null) => {
        set({
          propertyId,
          selectedProperty: propertyData,
          isConfigured: true,
          configuredAt: new Date().toISOString(),
        });
      },

      setKioskId: (kioskId) => {
        set({ kioskId });
      },

      setCapabilities: (capabilities) => {
        set({ capabilities });
      },

      setPropertyData: (propertyData) => {
        set({ selectedProperty: propertyData });
      },

      clearProperty: () => {
        set({
          propertyId: null,
          kioskId: null,
          capabilities: {
            checkIn: true,
            reservations: true,
            cardIssuance: true,
            lostCard: true,
          },
          isConfigured: false,
          configuredAt: null,
          selectedProperty: null,
        });
      },

      // Mark store as hydrated
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      initializeProperty: () => {
        const state = get();
        
        // Check if property is configured (both propertyId and isConfigured must be true)
        if (state.propertyId && state.isConfigured) {
          return true;
        }
        // If isConfigured is true but propertyId is missing, reset to false
        if (state.isConfigured && !state.propertyId) {
          set({ isConfigured: false });
        }
        return false;
      },

      // Update all property configuration at once
      configureProperty: (config) => {
        set({
          propertyId: config.propertyId,
          kioskId: config.kioskId || null,
          capabilities: config.capabilities || {
            checkIn: true,
            reservations: true,
            cardIssuance: true,
            lostCard: true,
          },
          selectedProperty: config.propertyData || null,
          isConfigured: true,
          configuredAt: new Date().toISOString(),
        });
      },
    }),
    {
      name: 'property-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        propertyId: state.propertyId,
        kioskId: state.kioskId,
        capabilities: state.capabilities,
        isConfigured: state.isConfigured,
        configuredAt: state.configuredAt,
        selectedProperty: state.selectedProperty, // Ensure full property object is persisted
      }),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export default usePropertyStore;


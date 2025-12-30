import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../config/constants';


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
        const propertyData = config.propertyData || {};
        const propertyId = config.propertyId || propertyData.property_id || propertyData.id;
        const organizationId = propertyData.organization_id || propertyData.organizationId;

        // Save to localStorage for API client
        if (propertyId && organizationId) {
          localStorage.setItem(STORAGE_KEYS.KIOSK_PROPERTY, JSON.stringify({
            propertyId,
            organizationId,
            kioskId: config.kioskId || null
          }));
        }

        set({
          propertyId,
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
      partialize: (state) => ({
        propertyId: state.propertyId,
        kioskId: state.kioskId,
        capabilities: state.capabilities,
        isConfigured: state.isConfigured,
        configuredAt: state.configuredAt,
        selectedProperty: state.selectedProperty,
      }),
    }
  )
);

export default usePropertyStore;


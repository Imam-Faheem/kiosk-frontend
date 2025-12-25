import { useEffect } from 'react';
import usePropertyStore from '../stores/propertyStore';

/**
 * Custom hook to access property store
 * Provides convenient access to propertyId, kioskId, capabilities, and isConfigured
 * 
 * @param {Object} options - Options for the hook
 * @param {boolean} options.required - If true, throws error when property is not configured
 * @returns {Object} Property store state and actions
 */
export const useProperty = (options = {}) => {
  const { required = false } = options;
  
  const propertyId = usePropertyStore((state) => state.propertyId);
  const kioskId = usePropertyStore((state) => state.kioskId);
  const capabilities = usePropertyStore((state) => state.capabilities);
  const isConfigured = usePropertyStore((state) => state.isConfigured);
  const selectedProperty = usePropertyStore((state) => state.selectedProperty);
  const configuredAt = usePropertyStore((state) => state.configuredAt);
  
  const setProperty = usePropertyStore((state) => state.setProperty);
  const setKioskId = usePropertyStore((state) => state.setKioskId);
  const setCapabilities = usePropertyStore((state) => state.setCapabilities);
  const clearProperty = usePropertyStore((state) => state.clearProperty);
  const configureProperty = usePropertyStore((state) => state.configureProperty);
  
  // Check if property is required and configured
  useEffect(() => {
    if (required && !isConfigured) {
      throw new Error('Property must be configured before using this feature');
    }
  }, [required, isConfigured]);
  
  return {
    propertyId,
    kioskId,
    capabilities,
    isConfigured,
    selectedProperty,
    configuredAt,
    setProperty,
    setKioskId,
    setCapabilities,
    clearProperty,
    configureProperty,
  };
};

export default useProperty;


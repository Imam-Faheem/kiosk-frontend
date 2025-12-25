import usePropertyStore from '../stores/propertyStore';

/**
 * Get property ID from Zustand store with fallback
 * @returns {string} Property ID
 */
export const getPropertyIdFromStore = () => {
  const propertyId = usePropertyStore.getState().propertyId;
  return propertyId || process.env.REACT_APP_PROPERTY_ID || 'BER';
};


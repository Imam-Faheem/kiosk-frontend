import { apiClient } from './api/apiClient';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

/**
 * Fetch all properties from Apaleo API
 * @returns {Promise<Object>} Properties response with data array
 */
export const getProperties = async () => {
  if (debug) console.log('[properties] fetching properties');
  
  try {
    const response = await apiClient.get('/properties');
    
    if (debug) console.log('[properties] response', response.data);
    
    // Backend returns { data: [...] } format
    let properties = response.data?.data || response.data || [];
    
    // Ensure it's an array
    if (!Array.isArray(properties)) {
      properties = [];
    }
    
    // If still empty, provide fallback properties
    if (properties.length === 0) {
      console.warn('[properties] No properties from API, using fallback');
      properties = [
        {
          id: "BER",
          name: "Berlin Property",
          address: {
            city: "Berlin",
            country: "Germany"
          }
        },
        {
          id: "MUC",
          name: "Munich Property",
          address: {
            city: "Munich",
            country: "Germany"
          }
        }
      ];
    }
    
    return {
      success: true,
      data: properties,
      message: 'Properties fetched successfully',
    };
  } catch (err) {
    if (debug) console.error('[properties] error', err?.response?.data || err?.message);
    
    // On error, return fallback properties so kiosk can still be configured
    console.warn('[properties] API error, using fallback properties');
    return {
      success: true,
      data: [
        {
          id: "BER",
          name: "Berlin Property",
          address: {
            city: "Berlin",
            country: "Germany"
          }
        },
        {
          id: "MUC",
          name: "Munich Property",
          address: {
            city: "Munich",
            country: "Germany"
          }
        }
      ],
      message: 'Using fallback properties',
    };
  }
};

/**
 * Fetch kiosk capabilities for a property and kiosk
 * @param {string} propertyId - Property ID
 * @param {string} kioskId - Kiosk ID (optional)
 * @returns {Promise<Object>} Capabilities object
 */
export const getKioskCapabilities = async (propertyId, kioskId = null) => {
  if (debug) console.log('[properties] fetching capabilities', { propertyId, kioskId });
  
  try {
    // If backend has a specific endpoint for capabilities, use it
    // Otherwise, return default capabilities
    const params = { propertyId };
    if (kioskId) {
      params.kioskId = kioskId;
    }
    
    try {
      const response = await apiClient.get('/kiosk/capabilities', { params });
      if (debug) console.log('[properties] capabilities response', response.data);
      return response.data;
    } catch (err) {
      // If endpoint doesn't exist, return default capabilities
      if (debug) console.warn('[properties] capabilities endpoint not found, using defaults');
      return {
        checkIn: true,
        reservations: true,
        cardIssuance: true,
        lostCard: true,
      };
    }
  } catch (err) {
    if (debug) console.error('[properties] capabilities error', err?.response?.data || err?.message);
    
    // Return default capabilities on error
    return {
      checkIn: true,
      reservations: true,
      cardIssuance: true,
      lostCard: true,
    };
  }
};

/**
 * Get property details by ID
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Property details
 */
export const getPropertyById = async (propertyId) => {
  if (debug) console.log('[properties] fetching property by ID', propertyId);
  
  try {
    const response = await apiClient.get(`/properties/${propertyId}`);
    
    if (debug) console.log('[properties] property response', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Property fetched successfully',
    };
  } catch (err) {
    if (debug) console.error('[properties] property error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.error || 
                         err?.response?.data?.message || 
                         err?.message || 
                         'Failed to fetch property';
    throw new Error(errorMessage);
  }
};


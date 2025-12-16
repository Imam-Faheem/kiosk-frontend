import { apiClient } from './api/apiClient';
import { getDefaultCapabilities } from '../lib/propertyUtils';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

export const getProperties = async () => {
  if (debug) console.log('[properties] fetching properties from Apaleo');
  
  try {
    const response = await apiClient.get('/properties');
    
    if (debug) console.log('[properties] API response:', response.data);
    
    // Backend returns { data: [...], count: number } format
    let properties = response.data?.data || [];
    
    // Ensure it's an array
    if (!Array.isArray(properties)) {
      console.warn('[properties] Response data is not an array:', properties);
      properties = [];
    }
    
    // Log the properties found
    if (debug) {
      console.log(`[properties] Found ${properties.length} properties from Apaleo:`, properties);
    }
    
    // If properties array is empty but response indicates fallback was used
    if (properties.length === 0 && response.data?.fallback) {
      console.warn('[properties] Using fallback properties from backend');
    }
    
    // Return properties (even if empty - let UI handle empty state)
    return {
      success: true,
      data: properties,
      count: properties.length,
      isFallback: response.data?.fallback || false,
      message: properties.length > 0 
        ? `Found ${properties.length} properties` 
        : 'No properties available',
    };
  } catch (err) {
    if (debug) console.error('[properties] API error:', err?.response?.data || err?.message);
    
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
      isFallback: true,
      message: 'Using fallback properties due to API error',
    };
  }
};

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
      return getDefaultCapabilities();
    }
  } catch (err) {
    if (debug) console.error('[properties] capabilities error', err?.response?.data || err?.message);
    
    // Return default capabilities on error
    return getDefaultCapabilities();
  }
};

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


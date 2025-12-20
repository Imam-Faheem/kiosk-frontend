import { apiClient } from './api/apiClient';
import { getDefaultCapabilities } from '../lib/propertyUtils';
import { API_CONFIG } from '../config/constants';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

export const getProperties = async () => {
  if (debug) console.log('[properties] fetching properties from API (public endpoint, no auth)');
  
  try {
    // Use organization-specific endpoint - this is a public endpoint, no auth required
    const organizationId = API_CONFIG.ORGANIZATION_ID;
    const endpoint = `/api/core/v1/organizations/${organizationId}/apaleo/properties`;
    
    if (debug) console.log('[properties] Fetching from endpoint:', endpoint);
    
    // Make request without any auth headers
    const response = await apiClient.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        // Explicitly do not include Authorization header
      }
    });
    
    if (debug) console.log('[properties] API response:', response.data);
    
    // New API returns { success: true, data: [...] } format
    let properties = response.data?.data || [];
    
    // Ensure it's an array
    if (!Array.isArray(properties)) {
      console.warn('[properties] Response data is not an array:', properties);
      properties = [];
    }
    
    // Normalize property data: map property_id to id, add currency and capabilities if missing
    const normalizedProperties = properties.map((property) => ({
      id: property.property_id || property.id, // Use property_id from API, fallback to id
      property_id: property.property_id, // Keep original property_id
      name: property.name || '',
      currency: property.currency || 'USD', // Default to USD if not provided
      capabilities: property.capabilities || [], // Default to empty array if not provided
      organization_id: property.organization_id,
      pms_type: property.pms_type,
      apaleo_external_property_id: property.apaleo_external_property_id,
      status: property.status,
      ...property, // Include any other fields
    }));
    
    // Log the properties found
    if (debug) {
      console.log(`[properties] Found ${normalizedProperties.length} properties:`, normalizedProperties);
    }
    
    // Return properties (even if empty - let UI handle empty state)
    return {
      success: true,
      data: normalizedProperties,
      count: normalizedProperties.length,
      message: normalizedProperties.length > 0 
        ? `Found ${normalizedProperties.length} properties` 
        : 'No properties available',
    };
  } catch (err) {
    if (debug) console.error('[properties] API error:', err?.response?.data || err?.message);
    
    // On error, return empty array and let UI handle the error
    console.error('[properties] Failed to fetch properties:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to load properties. Please try again.');
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


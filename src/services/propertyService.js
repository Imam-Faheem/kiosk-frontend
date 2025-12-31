import { apiClient } from './api/apiClient';
import { getDefaultCapabilities } from '../lib/propertyUtils';
import { API_CONFIG } from '../config/constants';

/**
 * Get properties for an organization
 * @param {Object} params - Optional query parameters (page, limit, etc.)
 * @param {string} organizationId - Organization ID (optional, defaults to API_CONFIG.ORGANIZATION_ID)
 * @returns {Promise<Object>} Response with success, data.properties array, and pagination
 */
export const getProperties = async (params = {}, organizationId = null) => {
  try {
    const orgId = organizationId || API_CONFIG.ORGANIZATION_ID;
    const endpoint = `/api/kiosk/v1/organizations/${orgId}/properties`;
    
    const response = await apiClient.get(endpoint, { params });
    
    // The API returns: { success: true, data: { properties: [...], pagination: {...} } }
    // Return the response data as-is
    return response.data;
  } catch (err) {
    console.error('[getProperties] Error:', {
      endpoint: `/api/kiosk/v1/organizations/${organizationId || API_CONFIG.ORGANIZATION_ID}/properties`,
      error: err.message,
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
    });

    // Handle network errors
    if (!err.response) {
      let networkError = 'Network error. Please check your connection.';
      
      if (err.code === 'ECONNABORTED') {
        networkError = 'Request timeout. The server took too long to respond.';
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        networkError = 'Network error. Please check your connection and ensure the server is running.';
      } else if (err.message) {
        networkError = err.message;
      }
      
      throw new Error(networkError);
    }

    // Handle HTTP errors
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.response?.statusText ??
      `Failed to fetch properties (${err?.response?.status || 'Unknown error'})`;
    
    throw new Error(errorMessage);
  }
};


export const getKioskCapabilities = async (propertyId, kioskId = null) => {
  // Return default capabilities since the endpoint doesn't exist
  return getDefaultCapabilities();
};

export const getPropertyById = async (propertyId) => {
  try {
    const response = await apiClient.get(`/properties/${propertyId}`);
    
    return {
      success: true,
      data: response.data,
      message: 'Property fetched successfully',
    };
  } catch (err) {
    const errorMessage = err?.response?.data?.error || 
                         err?.response?.data?.message || 
                         err?.message || 
                         'Failed to fetch property';
    throw new Error(errorMessage);
  }
};


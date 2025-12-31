import { apiClient } from './api/apiClient';
import { STORAGE_KEYS } from '../config/constants';

const extractProperties = (response) => {
  if (Array.isArray(response)) return { data: response, pagination: null };
  if (!response) return { data: [], pagination: null };

  const dataPaths = [
    response?.data?.properties,
    response?.data,
    response?.properties,
    response?.results
  ];

  const data = dataPaths.find(Array.isArray) || [];
  const pagination = response?.data?.properties === data
    ? response?.data?.pagination
    : response?.pagination ?? null;

  return { data, pagination };
};

/**
 * Get organization ID from localStorage or use default
 * @returns {string|null} Organization ID if available
 */
const getOrganizationId = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    
    const propertyData = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    if (propertyData) {
      const parsed = JSON.parse(propertyData);
      if (parsed.organizationId) {
        return parsed.organizationId;
      }
    }
    
    // Default organization ID - can be overridden via environment variable
    return process.env.REACT_APP_ORGANIZATION_ID || '0ujsszwN8NRY24YaXiTIE2VWDTS';
  } catch {
    // Fallback to default organization ID
    return process.env.REACT_APP_ORGANIZATION_ID || '0ujsszwN8NRY24YaXiTIE2VWDTS';
  }
};

/**
 * Get properties for an organization
 * @param {Object} params - Optional query parameters (page, limit, etc.)
 * @param {string} organizationId - Organization ID (optional, will try to get from localStorage or use default)
 * @returns {Promise<Object>} Response with success, data.properties array, and pagination
 */
export const getProperties = async (params = {}, organizationId = null) => {
  try {
    // Get organizationId from parameter, localStorage, or use default
    const orgId = organizationId || getOrganizationId();
    
    // Use organization-based endpoint
    const endpoint = `/api/kiosk/v1/organizations/${orgId}/properties`;
    
    const response = await apiClient.get(endpoint, { params });
    const { data, pagination } = extractProperties(response.data);
    return {
      success: response.data?.success !== false,
      data,
      pagination: pagination || null,
      message: response.data?.message
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      pagination: null,
      message: err.response?.data?.message || err.message || 'Failed to fetch properties'
    };
  }
};

export const getKioskCapabilities = async () => ({
  checkIn: true,
  reservations: true,
  cardIssuance: true,
  lostCard: true,
});

export const getPropertyById = async (propertyId) => {
  try {
    const response = await apiClient.get(`/properties/${propertyId}`);
    return { success: true, data: response.data, message: 'Property fetched successfully' };
  } catch (err) {
    throw new Error(err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Failed to fetch property');
  }
};


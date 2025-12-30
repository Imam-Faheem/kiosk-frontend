import { apiClient } from './api/apiClient';
import { API_CONFIG } from '../config/constants';

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

export const getProperties = async (params) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/properties`, { params });
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


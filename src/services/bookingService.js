import { apiClient } from './api/apiClient';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Get property and organization IDs from localStorage
 * @returns {Object} Property context with propertyId and organizationId
 */
const getPropertyContext = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { propertyId: null, organizationId: null };
    }
    
    const propertyData = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    if (!propertyData) {
      return { propertyId: null, organizationId: null };
    }

    const parsed = JSON.parse(propertyData);
    return {
      propertyId: parsed.propertyId ?? null,
      organizationId: parsed.organizationId ?? null,
    };
  } catch {
    return { propertyId: null, organizationId: null };
  }
};

/**
 * Create a booking
 * @param {Object} bookingData - Booking information with reservations array
 * @param {Array} bookingData.reservations - Array of reservation objects
 * @param {string} bookingData.reservations[].arrival - Check-in date (YYYY-MM-DD)
 * @param {string} bookingData.reservations[].departure - Check-out date (YYYY-MM-DD)
 * @param {number} bookingData.reservations[].adults - Number of adults
 * @param {string} bookingData.reservations[].channelCode - Channel code (e.g., 'Direct')
 * @param {Object} bookingData.reservations[].primaryGuest - Guest information
 * @param {Array} bookingData.reservations[].timeSlices - Array of time slices with ratePlanId
 * @returns {Promise<Object>} Booking response
 */
export const createBooking = async (bookingData) => {
  const { propertyId, organizationId } = getPropertyContext();

  if (!propertyId || !organizationId) {
    throw new Error('Property ID and Organization ID are required. Please select a property first.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/bookings`;
  const response = await apiClient.post(endpoint, bookingData);
  return response.data;
};

/**
 * Get reservation details by ID
 * @param {string} reservationId - Apaleo reservation ID
 * @returns {Promise<Object>} Reservation details
 */
export const getReservation = async (reservationId) => {
  const response = await apiClient.get(`/reservation/${reservationId}`);
  return response.data;
};


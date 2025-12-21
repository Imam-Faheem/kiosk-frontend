import { apiClient } from './api/apiClient';

/**
 * Save guest details to backend
 * @param {Object} guestData - Guest information
 * @param {string} guestData.firstName - First name
 * @param {string} guestData.lastName - Last name
 * @param {string} guestData.email - Email address
 * @param {string} guestData.phone - Phone number
 * @param {string} guestData.country - Country code
 * @param {string} guestData.addressStreet - Street address
 * @param {string} guestData.addressCity - City
 * @param {string} guestData.addressState - State/Province
 * @param {string} guestData.addressPostal - ZIP/Postal code
 * @param {string} guestData.propertyId - Property ID (optional)
 * @param {string} guestData.reservationId - Reservation ID (optional)
 * @returns {Promise<Object>} Saved guest details response
 */
export const saveGuestDetails = async (guestData) => {
  try {
    const response = await apiClient.post('/guests/details', guestData);
    return response.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Get guest details by ID or email
 * @param {Object} params - Search parameters
 * @param {number} params.guestId - Guest ID (optional)
 * @param {string} params.email - Email address (optional)
 * @returns {Promise<Object>} Guest details response
 */
export const getGuestDetails = async (params) => {
  try {
    const response = await apiClient.get('/guests/details', { params });
    return response.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Update Apaleo reservation with guest information
 * @param {string} reservationId - Apaleo reservation ID
 * @param {Object} guestData - Guest information
 * @param {string} propertyId - Property ID (optional)
 * @returns {Promise<Object>} Update response
 */
export const updateApaleoReservationWithGuest = async (reservationId, guestData, propertyId) => {
  try {
    const params = propertyId ? { propertyId } : {};
    const response = await apiClient.patch(`/guests/reservation/${reservationId}`, guestData, { params });
    return response.data;
  } catch (err) {
    throw err;
  }
};


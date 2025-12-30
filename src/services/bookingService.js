import { apiClient } from './api/apiClient';

/**
 * Create a booking in Apaleo
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.propertyId - Property ID
 * @param {string} bookingData.unitGroupId - Unit Group ID (room type)
 * @param {string} bookingData.ratePlanId - Rate Plan ID
 * @param {string} bookingData.arrival - Check-in date (YYYY-MM-DD)
 * @param {string} bookingData.departure - Check-out date (YYYY-MM-DD)
 * @param {number} bookingData.adults - Number of adults
 * @param {Object} bookingData.primaryGuest - Guest information
 * @param {string} hotelId - Hotel ID for the booking endpoint
 * @returns {Promise<Object>} Booking response from Apaleo
 */
export const createBooking = async (bookingData, hotelId) => {
  const response = await apiClient.post(`/booking/${hotelId}`, bookingData);
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


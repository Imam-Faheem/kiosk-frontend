import { apiClient } from './api/apiClient';
import usePropertyStore from '../stores/propertyStore';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

// Helper to get propertyId from store or fallback
const getPropertyId = () => {
  const propertyId = usePropertyStore.getState().propertyId;
  return propertyId || process.env.REACT_APP_PROPERTY_ID || 'BER';
};

/**
 * Validate reservation by ID and last name
 * @param {Object} data - Validation data
 * @param {string} data.reservationId - Reservation ID
 * @param {string} data.lastName - Guest's last name
 * @returns {Promise<Object>} Reservation details
 */
export const validateReservation = async (data) => {
  if (debug) console.log('[checkin] validating reservation', data);
  
  try {
    // First, fetch the reservation from Apaleo to validate it exists
    const reservationId = data.reservationId;
    const response = await apiClient.get(`/reservation/${reservationId}`);
    
    if (debug) console.log('[checkin] reservation response', response.data);
    
    const reservation = response.data;
    
    // Validate last name matches (case-insensitive)
    const lastName = data.lastName?.trim().toLowerCase();
    const reservationLastName = reservation?.primaryGuest?.lastName?.trim().toLowerCase();
    
    if (!lastName || !reservationLastName || lastName !== reservationLastName) {
      throw new Error('Last name does not match reservation records');
    }
    
    // Transform Apaleo reservation to frontend format
    const transformedReservation = {
      reservationId: reservation.id,
      id: reservation.id,
      firstName: reservation.primaryGuest?.firstName || '',
      lastName: reservation.primaryGuest?.lastName || '',
      email: reservation.primaryGuest?.email || '',
      phone: reservation.primaryGuest?.phone || '',
      checkIn: reservation.arrival,
      checkOut: reservation.departure,
      guests: reservation.numberOfAdults || 1,
      totalAmount: reservation.totalGrossAmount?.amount || 0,
      currency: reservation.totalGrossAmount?.currency || 'EUR',
      paymentStatus: reservation.balance?.amount <= 0 ? 'paid' : 'pending',
      balance: reservation.balance?.amount || 0,
      status: reservation.status,
      unitGroup: reservation.unitGroup,
      roomType: reservation.unitGroup?.name || 'Standard Room',
      roomNumber: reservation.unitGroup?.name || 'TBD', // Room number might not be assigned yet
      propertyId: reservation.property?.id || getPropertyId(),
      guestName: `${reservation.primaryGuest?.firstName || ''} ${reservation.primaryGuest?.lastName || ''}`.trim(),
      // Include full reservation for check-in API
      _apaleoReservation: reservation,
    };
    
    return {
      success: true,
      data: transformedReservation,
      message: 'Reservation validated successfully',
    };
  } catch (err) {
    if (debug) console.error('[checkin] validation error', err?.response?.data || err?.message);
    
    if (err?.response?.status === 404) {
      throw new Error('Reservation not found. Please check your reservation ID.');
    }
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to validate reservation';
    throw new Error(errorMessage);
  }
};

/**
 * Perform Apaleo check-in for a reservation
 * @param {Object} data - Check-in data
 * @param {string} data.reservation_id - Apaleo reservation ID
 * @param {string} data.property_id - Property ID (e.g., 'BER')
 * @returns {Promise<Object>} Check-in response
 */
export const performCheckIn = async (data) => {
  if (debug) console.log('[checkin] performing check-in', data);
  
  try {
    const response = await apiClient.post('/apaleo-check-in', {
      reservation_id: data.reservation_id || data.reservationId,
      property_id: data.property_id || data.propertyId || getPropertyId(),
    });
    
    if (debug) console.log('[checkin] check-in response', response.data);
    
    return response.data;
  } catch (err) {
    if (debug) console.error('[checkin] check-in error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to perform check-in';
    throw new Error(errorMessage);
  }
};

/**
 * Get reservation details by ID
 * @param {string} reservationId - Reservation ID
 * @returns {Promise<Object>} Reservation details
 */
export const getReservationDetails = async (reservationId) => {
  if (debug) console.log('[checkin] fetching reservation details', reservationId);
  
  try {
    const response = await apiClient.get(`/reservation/${reservationId}`);
    
    if (debug) console.log('[checkin] reservation details', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Reservation details retrieved successfully',
    };
  } catch (err) {
    if (debug) console.error('[checkin] fetch error', err?.response?.data || err?.message);
    
    if (err?.response?.status === 404) {
      throw new Error('Reservation not found');
    }
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch reservation';
    throw new Error(errorMessage);
  }
};


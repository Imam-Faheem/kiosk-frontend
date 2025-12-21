import { apiClient } from './api/apiClient';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

/**
 * Validate guest for lost card replacement
 * Validates reservation ID, room number, and last name
 * @param {Object} data - Validation data
 * @param {string} data.reservationNumber - Reservation ID
 * @param {string} data.roomNumber - Room number
 * @param {string} data.lastName - Guest's last name
 * @returns {Promise<Object>} Validation result with guest data
 */
export const validateLostCardGuest = async (data) => {
  try {
    const { reservationNumber, roomNumber, lastName } = data;
    
    // First, fetch the reservation from Apaleo
    const reservationResponse = await apiClient.get(`/reservation/${reservationNumber}`);
    const reservation = reservationResponse.data;
    
    // Validate last name matches (case-insensitive)
    const lastNameLower = lastName?.trim().toLowerCase();
    const reservationLastName = reservation?.primaryGuest?.lastName?.trim().toLowerCase();
    
    if (!lastNameLower || !reservationLastName || lastNameLower !== reservationLastName) {
      throw new Error('Last name does not match reservation records');
    }
    
    // Validate room number if available
    // Note: Room assignment might be in reservation.unit.id or reservation.unit.code
    const assignedRoom = reservation?.unit?.code || reservation?.unit?.name || reservation?.unit?.id;
    if (roomNumber && assignedRoom && assignedRoom.toLowerCase() !== roomNumber.toLowerCase()) {
      throw new Error('Room number does not match reservation records');
    }
    
    // Transform Apaleo reservation to frontend format
    const guestData = {
      reservationId: reservation.id,
      reservationNumber: reservation.id,
      roomNumber: assignedRoom || roomNumber || 'TBD',
      lastName: reservation.primaryGuest?.lastName || '',
      firstName: reservation.primaryGuest?.firstName || '',
      email: reservation.primaryGuest?.email || '',
      phone: reservation.primaryGuest?.phone || '',
      guestName: `${reservation.primaryGuest?.firstName || ''} ${reservation.primaryGuest?.lastName || ''}`.trim(),
      checkIn: reservation.arrival,
      checkOut: reservation.departure,
      propertyId: reservation.property?.id || 'BER',
      // Include full reservation for later use
      _apaleoReservation: reservation,
    };
    
    return {
      success: true,
      data: guestData,
      message: 'Guest validated successfully',
    };
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new Error('Reservation not found. Please check your reservation number.');
    }
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to validate guest';
    throw new Error(errorMessage);
  }
};

/**
 * Regenerate card/passcode for lost card
 * Deactivates old passcodes and creates new ones
 * @param {Object} data - Regeneration data
 * @param {string} data.reservationId - Reservation ID
 * @param {string} data.roomNumber - Room number
 * @param {string} data.propertyId - Property ID
 * @returns {Promise<Object>} New card/passcode data
 */
export const regenerateLostCard = async (data) => {
  try {
    const { reservationId, roomNumber, propertyId } = data;
    const property = propertyId || process.env.REACT_APP_PROPERTY_ID || 'BER';
    
    // Call backend endpoint to regenerate passcode
    // The backend will:
    // 1. Delete old passcodes for this reservation
    // 2. Generate new passcode
    // 3. Send email with new access details
    const response = await apiClient.post('/lost-card/regenerate', {
      reservation_id: reservationId,
      property_id: property,
      room_number: roomNumber,
    });
    
    return {
      success: true,
      data: {
        cardId: response.data.cardId || `CARD-${Date.now()}`,
        accessCode: response.data.accessCode || response.data.passcode,
        status: 'active',
        roomNumber: roomNumber,
        reservationId: reservationId,
        oldCardDeactivated: response.data.oldCardDeactivated !== false,
        ...response.data,
      },
      message: response.data.message || 'Card regenerated successfully',
    };
  } catch (err) {
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to regenerate card';
    throw new Error(errorMessage);
  }
};


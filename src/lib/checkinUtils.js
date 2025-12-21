/**
 * Check-in related utility functions
 */

/**
 * Formats a checkout date string to a readable format
 * @param {string} dateStr - Date string to format
 * @returns {string} Formatted date string or 'N/A'
 */
export const formatCheckOut = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  try {
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

/**
 * Calculates display data from reservation, check-in data, and check-in result
 * @param {Object} reservation - Reservation object
 * @param {Object} checkInData - Check-in data from API
 * @param {Object} checkInResult - Check-in result from API
 * @returns {Object|null} Display data object or null
 */
export const calculateDisplayData = (reservation, checkInData, checkInResult) => {
  if (!reservation) return null;

  // Priority: checkInData > checkInResult > reservation
  const checkInInfo = checkInData || checkInResult?.data || {};
  
  return {
    reservationId: reservation.reservationId || reservation.id,
    guestName: reservation.guestName || 
              `${reservation.firstName || ''} ${reservation.lastName || ''}`.trim() ||
              `${reservation.guest_name?.first_name || ''} ${reservation.guest_name?.last_name || ''}`.trim() ||
              checkInInfo.guest_name || 'Guest',
    roomNumber: checkInInfo.room_number || 
                checkInInfo.roomNumber || 
                reservation.roomNumber || 
                reservation.room_number || 
                'TBD',
    checkOut: reservation.checkOut || 
              reservation.check_out_date || 
              reservation.check_out || 
              checkInInfo.check_out_date ||
              (reservation.checkOutDate ? new Date(reservation.checkOutDate).toLocaleDateString() : 
               reservation.check_out_date ? new Date(reservation.check_out_date).toLocaleDateString() : 'N/A'),
    checkInTime: checkInInfo.checked_in_at || 
                 checkInInfo.checkInTime ||
                 new Date().toISOString(),
    status: checkInInfo.status || checkInResult?.data?.status || 'checked_in',
  };
};


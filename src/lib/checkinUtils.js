export const formatCheckOut = (dateStr) => {
  const invalidValues = [null, undefined, '', 'N/A'];
  if (invalidValues.includes(dateStr)) return 'N/A';
  
  try {
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

/**
 * Get guest name from reservation data
 * @param {Object} reservation - Reservation object
 * @param {Object} checkInInfo - Optional check-in info object
 * @returns {string} Guest name
 */
export const getGuestName = (reservation, checkInInfo = null) => {
  if (!reservation) return 'Guest';
  
  if (typeof reservation.guest_name === 'string') {
    return reservation.guest_name;
  }
  
  if (reservation.guest_name) {
    const firstName = reservation.guest_name.first_name ?? '';
    const lastName = reservation.guest_name.last_name ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
  }
  
  if (checkInInfo?.guest_name) return checkInInfo.guest_name;
  
  return reservation.guestName ?? 'Guest';
};

/**
 * Normalize reservation data fields to consistent format
 * @param {Object} data - Reservation data object
 * @returns {Object} Normalized data object
 */
export const normalizeReservationData = (data) => ({
  reservation_id: data.reservation_id ?? data.reservationId,
  guest_email: data.guest_email ?? data.guestEmail,
  guest_phone: data.guest_phone ?? data.guestPhone,
  guest_name: {
    first_name: data.guest_name?.first_name ?? data.firstName ?? '',
    last_name: data.guest_name?.last_name ?? data.lastName ?? '',
  },
  check_in_date: data.check_in_date ?? data.checkInDate ?? new Date().toISOString(),
  check_out_date: data.check_out_date ?? data.checkOutDate,
  room_number: data.room_number ?? data.roomNumber,
  confirmation_code: data.confirmation_code ?? data.confirmationCode,
});

const getCheckOutDate = (checkInInfo, reservation) => {
  const checkOutDate = checkInInfo.check_out_date ?? reservation.check_out_date;
  return checkOutDate ? formatCheckOut(checkOutDate) : 'N/A';
};

export const calculateDisplayData = (reservation, checkInData, checkInResult) => {
  if (!reservation) return null;

  const checkInInfo = checkInData ?? checkInResult?.data ?? {};

  return {
    reservationId: reservation.reservation_id ?? reservation.id,
    guestName: getGuestName(reservation, checkInInfo),
    roomNumber: checkInInfo.room_number ?? reservation.room_number ?? 'TBD',
    checkOut: getCheckOutDate(checkInInfo, reservation),
    checkInTime: checkInInfo.checked_in_at ?? new Date().toISOString(),
    status: checkInInfo.status ?? checkInResult?.data?.status ?? 'checked_in',
  };
};

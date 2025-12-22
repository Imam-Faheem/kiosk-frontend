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

const getGuestName = (reservation, checkInInfo) => {
  if (typeof reservation.guest_name === 'string') {
    return reservation.guest_name;
  }
  
  const firstName = reservation.guest_name?.first_name ?? '';
  const lastName = reservation.guest_name?.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;
  
  return checkInInfo.guest_name ?? 'Guest';
};

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

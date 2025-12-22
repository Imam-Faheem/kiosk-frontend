/**
 * Check if payment status indicates completion
 * @param {string} status - Payment status
 * @returns {boolean} True if payment is completed
 */
export const isPaymentCompleted = (status) => {
  if (status === 'completed') return true;
  if (status === 'paid') return true;
  return false;
};

/**
 * Get payment status from reservation data
 * @param {Object} reservation - Reservation object
 * @returns {string} Payment status ('paid' or 'pending')
 */
export const getPaymentStatus = (reservation) => {
  if (reservation.paymentStatus) return reservation.paymentStatus;
  return reservation.balance <= 0 ? 'paid' : 'pending';
};


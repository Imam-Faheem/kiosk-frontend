export const validateBookingRequirements = ({ ratePlanId, arrival, departure, adults }) => {
  if (!ratePlanId) {
    throw new Error('Rate plan ID is required for booking');
  }
  
  if (!arrival || !departure) {
    throw new Error('Arrival and departure dates are required');
  }
  
  if (!adults || adults < 1) {
    throw new Error('At least one adult is required');
  }
};


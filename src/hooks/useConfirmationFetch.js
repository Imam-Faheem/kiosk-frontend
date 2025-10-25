import { useState } from 'react';
import { fetchReservationFromBackend } from '../services/reservationService';

export const useBackendValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const validateReservation = async (reservationData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchReservationFromBackend(reservationData);
      
      if (result.success) {
        setData(result.data);
        return result;
      } else {
        throw new Error(result.message || 'Failed to validate reservation');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while validating reservation';
      setError(errorMessage);
      console.error('Reservation validation error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    validateReservation,
    isLoading,
    error,
    data,
    reset
  };
};

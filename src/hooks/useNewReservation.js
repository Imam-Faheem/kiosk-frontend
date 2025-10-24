import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api/apiClient';
import { notifications } from '@mantine/notifications';

export const useNewReservation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReservation = useCallback(async (reservationData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/reservations', reservationData);
      
      notifications.show({
        title: 'Success',
        message: 'Reservation created successfully',
        color: 'green',
      });

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create reservation';
      setError(errorMessage);
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReservation = useCallback(async (reservationId, updateData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/reservations/${reservationId}`, updateData);
      
      notifications.show({
        title: 'Success',
        message: 'Reservation updated successfully',
        color: 'green',
      });

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update reservation';
      setError(errorMessage);
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteReservation = useCallback(async (reservationId) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/reservations/${reservationId}`);
      
      notifications.show({
        title: 'Success',
        message: 'Reservation deleted successfully',
        color: 'green',
      });

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete reservation';
      setError(errorMessage);
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createReservation,
    updateReservation,
    deleteReservation,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

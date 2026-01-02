import { apiClient } from './api/apiClient';
import { validateReservation as validateReservationApaleo } from './checkinService';
import { translateError } from '../utils/translations';

// Validate reservation for check-in using Apaleo API
export const validateReservation = async (data) => {
  return await validateReservationApaleo(data);
};

export const createReservation = async (data) => {
  const response = await apiClient.post('/reservations/create', data);
  return response.data;
};

export const getReservationById = async (reservationId) => {
  try {
    const response = await apiClient.get(`/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFound'));
    }
    throw error;
  }
};

export const updateReservation = async (reservationId, data) => {
  const response = await apiClient.put(`/reservations/${reservationId}`, data);
  return response.data;
};

export const cancelReservation = async (reservationId) => {
  const response = await apiClient.delete(`/reservations/${reservationId}`);
  return response.data;
};

export const searchReservations = async (params) => {
  const response = await apiClient.get('/reservations/search', { params });
  return response.data;
};

export const fetchReservations = async () => {
  return searchReservations();
};
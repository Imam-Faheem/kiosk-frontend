import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock } from './mockData';

export const processCheckIn = async (data) => {
  try {
    const payload = {
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
    };
    const response = await apiClient.post('/api/kiosk/v1/check-in', payload);
    
    return {
      success: true,
      data: response.data.data ?? response.data,
      message: response.data.message ?? 'Check-in completed successfully',
    };
  } catch (error) {
    if (shouldUseMock(error)) {
      return mockData.checkIn(data);
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                         'Failed to process check-in';
    throw new Error(message);
  }
};

export const getCheckInStatus = async (reservationId) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/check-in/${reservationId}/status`);
    
    return {
      success: true,
      data: response.data.data ?? response.data,
      message: 'Check-in status retrieved successfully',
    };
  } catch (error) {
    if (shouldUseMock(error)) {
      return mockData.checkInStatus(reservationId);
    }
    
    if (error?.response?.status === 404) {
      throw new Error('Check-in not found');
    }
    
    const message = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch check-in status';
    throw new Error(message);
  }
};

export const validateReservation = async (data) => {
  const reservationId = data.reservationId ?? data.reservation_id;
  const lastName = data.lastName ?? data.last_name;
  
  if (!reservationId) {
    throw new Error('Reservation ID is required');
  }
  if (!lastName) {
    throw new Error('Last name is required');
  }
  
  try {
    const response = await apiClient.get(`/api/kiosk/v1/reservations/${reservationId}`, {
      params: { lastName },
    });
    
    const reservationData = response.data.data ?? response.data;
    
    if (!reservationData || (!reservationData.reservation_id && !reservationData.id)) {
      throw new Error('Invalid reservation data received from server');
    }
    
    return {
      success: true,
      data: reservationData,
      message: response.data.message ?? 'Reservation validated successfully',
    };
  } catch (error) {
    const isNetworkError = !error?.response || error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK';
    const isValidationError = error?.response?.status === 404 || error?.response?.status === 403;

    if ((isNetworkError || shouldUseMock(error)) && !isValidationError) {
      return mockData.reservation(data);
    }
    
    if (error?.response?.status === 404) {
      throw new Error('Reservation not found. Please check your reservation ID and last name.');
    }
    
    if (error?.response?.status === 403) {
      throw new Error('Invalid last name. Please verify your information.');
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                         'Failed to validate reservation';
    throw new Error(message);
  }
};

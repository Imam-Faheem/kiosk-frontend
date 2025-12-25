import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock, simulateApiDelay } from './mockData';
import usePropertyStore from '../stores/propertyStore';

export const validateLostCardGuest = async (data) => {
  try {
    const { reservationNumber, roomNumber, lastName } = data;

    const reservationResponse = await apiClient.get(`/reservation/${reservationNumber}`);
    const reservation = reservationResponse.data;

    const lastNameLower = lastName?.trim().toLowerCase();
    const reservationLastName = reservation?.primaryGuest?.lastName?.trim().toLowerCase();

    if (!lastNameLower || !reservationLastName || lastNameLower !== reservationLastName) {
      throw new Error('Last name does not match reservation records');
    }

    const assignedRoom = reservation?.unit?.code ?? reservation?.unit?.name ?? reservation?.unit?.id;
    if (roomNumber && assignedRoom && assignedRoom.toLowerCase() !== roomNumber.toLowerCase()) {
      throw new Error('Room number does not match reservation records');
    }

    const primaryGuest = reservation?.primaryGuest ?? {};
    const propertyId = usePropertyStore.getState().propertyId ?? process.env.REACT_APP_PROPERTY_ID ?? 'BER';

    const guestData = {
      reservationId: reservation.id,
      reservationNumber: reservation.id,
      roomNumber: assignedRoom ?? roomNumber ?? 'TBD',
      lastName: primaryGuest.lastName ?? '',
      firstName: primaryGuest.firstName ?? '',
      email: primaryGuest.email ?? '',
      phone: primaryGuest.phone ?? '',
      guestName: `${primaryGuest.firstName ?? ''} ${primaryGuest.lastName ?? ''}`.trim(),
      checkIn: reservation.arrival,
      checkOut: reservation.departure,
      propertyId: reservation.property?.id ?? propertyId,
      _apaleoReservation: reservation,
    };

    return {
      success: true,
      data: guestData,
      message: 'Guest validated successfully',
    };
  } catch (error) {
    if (shouldUseMock(error) && error?.response?.status !== 404) {
      await simulateApiDelay(600);
      return mockData.validateLostCardGuest(data);
    }

    if (error?.response?.status === 404) {
      throw new Error('Reservation not found. Please check your reservation number.');
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to validate guest';
    throw new Error(message);
  }
};

export const regenerateLostCard = async (data) => {
  try {
    const { reservationId, roomNumber, propertyId } = data;

    const response = await apiClient.post('/lost-card/regenerate', {
      reservation_id: reservationId,
      property_id: propertyId ?? usePropertyStore.getState().propertyId ?? process.env.REACT_APP_PROPERTY_ID ?? 'BER',
      room_number: roomNumber,
    });

    return {
      success: true,
      data: {
        cardId: response.data.cardId ?? `CARD-${Date.now()}`,
        accessCode: response.data.accessCode ?? response.data.passcode,
        status: 'active',
        roomNumber,
        reservationId,
        oldCardDeactivated: response.data.oldCardDeactivated !== false,
        ...response.data,
      },
      message: response.data.message ?? 'Card regenerated successfully',
    };
  } catch (error) {
    if (shouldUseMock(error)) {
      await simulateApiDelay(800);
      return mockData.regenerateLostCard(data);
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to regenerate card';
    throw new Error(message);
  }
};


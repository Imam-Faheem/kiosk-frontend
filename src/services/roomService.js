import { apiClient } from './api/apiClient';
import { simulateApiDelay, mockRooms, mockErrors } from './mockData';

// Search room availability
export const searchRoomAvailability = async (data) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.post('/rooms/availability', data);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    const { checkIn, checkOut, guests } = data;
    
    // Simulate availability based on dates
    const availableRooms = mockRooms.filter(room => {
      // Simple availability logic - in real app, this would check actual availability
      return room.available && room.maxGuests >= guests;
    });
    
    return {
      success: true,
      data: {
        checkIn,
        checkOut,
        guests,
        availableRooms: availableRooms.map(room => ({
          ...room,
          pricePerNight: room.basePrice,
          totalPrice: room.basePrice * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)),
          available: true
        })),
        totalAvailable: availableRooms.length
      },
      message: `${availableRooms.length} rooms available for selected dates`
    };
  }
};

// Get room details
export const getRoomDetails = async (roomTypeId) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.get(`/rooms/${roomTypeId}/details`);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    const room = mockRooms.find(r => r.roomTypeId === roomTypeId);
    
    if (!room) {
      throw new Error('Room not found');
    }
    
    return {
      success: true,
      data: {
        ...room,
        taxes: {
          rate: 0.1, // 10% tax
          amount: room.basePrice * 0.1
        },
        fees: {
          serviceFee: 15.00,
          cleaningFee: 25.00
        }
      },
      message: 'Room details retrieved successfully'
    };
  }
};

// Get all room types
export const getAllRoomTypes = async () => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.get('/rooms/types');
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: mockRooms,
      message: 'Room types retrieved successfully'
    };
  }
};

// Calculate room pricing
export const calculateRoomPricing = (room, checkIn, checkOut) => {
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const basePrice = room.basePrice * nights;
  const taxRate = 0.1; // 10% tax
  const serviceFee = 15.00;
  const cleaningFee = 25.00;
  
  const subtotal = basePrice;
  const tax = subtotal * taxRate;
  const total = subtotal + tax + serviceFee + cleaningFee;
  
  return {
    basePrice: room.basePrice,
    nights,
    subtotal,
    tax,
    serviceFee,
    cleaningFee,
    total,
    currency: room.currency
  };
};

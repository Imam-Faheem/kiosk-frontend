import { API_CONFIG } from '../config/constants';

// Mock data generators for fallback when API fails
export const mockData = {
  // Check-in mock data
  checkIn: (data) => ({
    success: true,
    data: {
      check_in_id: `checkin_${Date.now()}`,
      reservation_id: data?.reservation_id ?? data?.reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      guest_name: data?.guest_name?.last_name ?? data?.lastName ?? 'Guest',
      room_number: data?.room_number ?? data?.roomNumber ?? '101',
      check_in_date: data?.check_in_date ?? data?.checkInDate ?? new Date().toISOString(),
      check_out_date: data?.check_out_date ?? data?.checkOutDate ?? new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      guest_email: data?.guest_email ?? data?.guestEmail ?? 'guest@example.com',
      guest_phone: data?.guest_phone ?? data?.guestPhone ?? '+1234567890',
    },
    message: 'Check-in completed successfully (mock)',
  }),

  checkInStatus: (reservationId) => ({
    success: true,
    data: {
      reservation_id: reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      room_number: '101',
      guest_name: 'John Doe',
    },
    message: 'Check-in status retrieved successfully (mock)',
  }),

  reservation: (data) => ({
    success: true,
    data: {
      reservation_id: data?.reservationId ?? data?.reservation_id ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      id: data?.reservationId ?? data?.reservation_id ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      guest_name: {
        first_name: 'John',
        last_name: data?.lastName ?? data?.last_name ?? 'Doe',
      },
      firstName: 'John',
      lastName: data?.lastName ?? data?.last_name ?? 'Doe',
      guest_email: 'guest@example.com',
      guest_phone: '+1234567890',
      check_in_date: new Date().toISOString(),
      check_out_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      room_number: '101',
    roomNumber: '101',
      status: 'confirmed',
      confirmation_code: 'CONF123',
    },
    message: 'Reservation validated successfully (mock)',
  }),

  // Checkout mock data
  checkout: (data) => ({
    success: true,
    data: {
      checkout_id: `checkout_${Date.now()}`,
      reservation_id: data?.reservation_id ?? data?.reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      room_number: data?.room_number ?? data?.roomNumber ?? '101',
      final_bill_amount: data?.final_bill_amount ?? data?.finalBillAmount ?? 150.00,
      payment_status: data?.payment_status ?? data?.paymentStatus ?? 'completed',
      check_out_date: data?.check_out_date ?? data?.checkOutDate ?? new Date().toISOString(),
      checked_out_at: new Date().toISOString(),
      status: 'checked_out',
    },
    message: 'Checkout completed successfully (mock)',
  }),

  checkoutStatus: (reservationId) => ({
    success: true,
    data: {
      reservation_id: reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      status: 'checked_out',
      checked_out_at: new Date().toISOString(),
      final_bill_amount: 150.00,
      payment_status: 'completed',
    },
    message: 'Checkout status retrieved successfully (mock)',
  }),

  // Digital key mock data
  digitalKey: (data) => ({
    success: true,
    data: {
      key_id: `key_${Date.now()}`,
      reservation_id: data?.reservation_id ?? data?.reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      lock_id: data?.lock_id ?? data?.lockId ?? API_CONFIG.DEFAULT_LOCK_ID,
      room_number: data?.room_number ?? data?.roomNumber ?? '101',
      key_type: data?.key_type ?? data?.keyType ?? 2,
      key_name: data?.key_name ?? data?.keyName ?? 'Guest Key',
      key_code: '12345678',
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      start_date: data?.start_date ?? data?.startDate ?? new Date().toISOString(),
      end_date: data?.end_date ?? data?.endDate ?? new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'active',
      issued_at: new Date().toISOString(),
    },
    message: 'Digital key issued successfully (mock)',
  }),

  digitalKeyGet: (keyId) => ({
    success: true,
    data: {
      key_id: keyId ?? `key_${Date.now()}`,
      key_code: '12345678',
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      status: 'active',
      room_number: '101',
    },
    message: 'Digital key retrieved successfully (mock)',
  }),

  // Payment mock data
  payment: (data) => ({
    success: true,
    data: {
      transaction_id: `txn_${Date.now()}`,
      reservation_id: data?.reservation_id ?? data?.reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      amount: data?.amount ?? 150.00,
      currency: data?.currency ?? 'USD',
      payment_method: {
        type: data?.payment_method?.type ?? data?.paymentMethod?.type ?? 'card',
        card_last4: data?.payment_method?.card_last4 ?? data?.paymentMethod?.cardLast4 ?? '1234',
        card_brand: data?.payment_method?.card_brand ?? data?.paymentMethod?.cardBrand ?? 'visa',
      },
      status: 'completed',
      processed_at: new Date().toISOString(),
      description: data?.description ?? 'Room charges and taxes',
    },
    message: 'Payment processed successfully (mock)',
  }),

  paymentStatus: (reservationId) => ({
    success: true,
    data: {
      reservation_id: reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      status: 'completed',
      amount: 150.00,
      currency: 'USD',
      payment_method: {
        type: 'card',
        card_last4: '1234',
        card_brand: 'visa',
      },
    },
    message: 'Payment status retrieved successfully (mock)',
  }),

  paymentHistory: (params) => ({
    success: true,
    data: [
      {
        transaction_id: 'txn_1',
        reservation_id: params?.reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
        amount: 150.00,
        currency: 'USD',
        status: 'completed',
        processed_at: new Date().toISOString(),
      },
    ],
    pagination: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      total: 1,
    },
    message: 'Payment history retrieved successfully (mock)',
  }),

  refund: (transactionId, data) => ({
    success: true,
    data: {
      refund_id: `refund_${Date.now()}`,
      transaction_id: transactionId,
      amount: data?.amount ?? 150.00,
      currency: data?.currency ?? 'USD',
      reason: data?.reason ?? 'Refund request',
      status: 'completed',
      processed_at: new Date().toISOString(),
    },
    message: 'Refund processed successfully (mock)',
  }),

  // Room availability mock data
  roomAvailability: (data) => {
    const arrival = data?.checkIn ?? data?.arrival ?? new Date().toISOString().split('T')[0];
    const departure = data?.checkOut ?? data?.departure ?? new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const adults = Number(data?.guests ?? data?.adults ?? 1);
    const nights = Math.max(1, Math.ceil((new Date(departure) - new Date(arrival)) / (1000 * 60 * 60 * 24)));

    const mockRooms = [
      {
        roomTypeId: 'RT-001',
        unitGroupId: 'RT-001',
        ratePlanId: 'RP-001',
        name: 'Deluxe Room',
        description: 'Spacious room with city view, king-size bed, and modern amenities. Perfect for couples or solo travelers.',
        capacity: 2,
        maxGuests: 2,
        amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Room Service'],
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
        ],
        pricePerNight: 120.00,
        totalPrice: 120.00 * nights,
        currency: 'EUR',
        available: true,
        _offerData: {
          unitGroupId: 'RT-001',
          ratePlanId: 'RP-001',
          arrival,
          departure,
        },
      },
      {
        roomTypeId: 'RT-002',
        unitGroupId: 'RT-002',
        ratePlanId: 'RP-002',
        name: 'Executive Suite',
        description: 'Luxurious suite with separate living area, premium furnishings, and stunning views. Ideal for business travelers.',
        capacity: 3,
        maxGuests: 3,
        amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Room Service', 'Work Desk', 'Sofa'],
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        ],
        pricePerNight: 180.00,
        totalPrice: 180.00 * nights,
        currency: 'EUR',
        available: true,
        _offerData: {
          unitGroupId: 'RT-002',
          ratePlanId: 'RP-002',
          arrival,
          departure,
        },
      },
      {
        roomTypeId: 'RT-003',
        unitGroupId: 'RT-003',
        ratePlanId: 'RP-003',
        name: 'Family Room',
        description: 'Comfortable family room with two queen beds, extra space, and family-friendly amenities. Perfect for families with children.',
        capacity: 4,
        maxGuests: 4,
        amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Room Service', 'Extra Beds', 'Crib Available'],
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
        ],
        pricePerNight: 150.00,
        totalPrice: 150.00 * nights,
        currency: 'EUR',
        available: true,
        _offerData: {
          unitGroupId: 'RT-003',
          ratePlanId: 'RP-003',
          arrival,
          departure,
        },
      },
      {
        roomTypeId: 'RT-004',
        unitGroupId: 'RT-004',
        ratePlanId: 'RP-004',
        name: 'Presidential Suite',
        description: 'Ultra-luxurious suite with panoramic views, premium amenities, and exclusive access. The ultimate hotel experience.',
        capacity: 2,
        maxGuests: 2,
        amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Room Service', 'Jacuzzi', 'Balcony', 'Butler Service'],
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
        ],
        pricePerNight: 350.00,
        totalPrice: 350.00 * nights,
        currency: 'EUR',
        available: true,
        _offerData: {
          unitGroupId: 'RT-004',
          ratePlanId: 'RP-004',
          arrival,
          departure,
        },
      },
    ];

    // Filter rooms based on guest capacity
    const filteredRooms = mockRooms.filter(room => room.maxGuests >= adults);

    return {
      success: true,
      data: {
        checkIn: arrival,
        checkOut: departure,
        guests: adults,
        availableRooms: filteredRooms,
        totalAvailable: filteredRooms.length,
      },
      message: `${filteredRooms.length} rooms available for selected dates`,
    };
  },

  // Room details mock data
  roomDetails: (roomTypeId) => ({
    success: true,
    data: {
      roomTypeId: roomTypeId ?? 'RT-001',
      name: 'Deluxe Room',
      description: 'Spacious room with city view, king-size bed, and modern amenities.',
      capacity: 2,
      maxGuests: 2,
      amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Room Service'],
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      ],
      basePrice: 120.00,
      currency: 'EUR',
    },
    message: 'Room details retrieved successfully',
  }),

  // Room types mock data
  roomTypes: () => ({
    success: true,
    data: [
      {
        roomTypeId: 'RT-001',
        name: 'Deluxe Room',
        description: 'Spacious room with city view',
        maxPersons: 2,
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        ],
      },
      {
        roomTypeId: 'RT-002',
        name: 'Executive Suite',
        description: 'Luxurious suite with separate living area',
        maxPersons: 3,
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        ],
      },
      {
        roomTypeId: 'RT-003',
        name: 'Family Room',
        description: 'Comfortable family room with two queen beds',
        maxPersons: 4,
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        ],
      },
      {
        roomTypeId: 'RT-004',
        name: 'Presidential Suite',
        description: 'Ultra-luxurious suite with panoramic views',
        maxPersons: 2,
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
        ],
      },
    ],
    message: 'Room types retrieved successfully',
  }),

  // Guest details mock data
  saveGuestDetails: (data) => ({
    success: true,
    data: {
      guestId: `GUEST-${Date.now()}`,
      firstName: data?.firstName ?? 'John',
      lastName: data?.lastName ?? 'Doe',
      email: data?.email ?? 'guest@example.com',
      phone: data?.phone ?? '+1234567890',
      country: data?.country ?? 'US',
      addressStreet: data?.addressStreet ?? '123 Main St',
      addressCity: data?.addressCity ?? 'New York',
      addressState: data?.addressState ?? 'NY',
      addressPostal: data?.addressPostal ?? '10001',
      propertyId: data?.propertyId ?? 'BER',
      createdAt: new Date().toISOString(),
    },
    message: 'Guest details saved successfully (mock)',
  }),

  getGuestDetails: (params) => ({
    success: true,
    data: {
      guestId: params?.guestId ?? `GUEST-${Date.now()}`,
      firstName: 'John',
      lastName: 'Doe',
      email: params?.email ?? 'guest@example.com',
      phone: '+1234567890',
      country: 'US',
      addressStreet: '123 Main St',
      addressCity: 'New York',
      addressState: 'NY',
      addressPostal: '10001',
    },
    message: 'Guest details retrieved successfully (mock)',
  }),

  updateApaleoReservationWithGuest: (reservationId, guestData) => ({
    success: true,
    data: {
      reservationId: reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      guestId: `GUEST-${Date.now()}`,
      ...guestData,
      updatedAt: new Date().toISOString(),
    },
    message: 'Reservation updated with guest details successfully (mock)',
  }),

  // Booking mock data
  createBooking: (data) => {
    const reservationId = `RES-${Date.now()}`;
    return {
      id: reservationId,
      reservationId: reservationId,
      reservation: {
        id: reservationId,
        status: 'confirmed',
        arrival: data?.arrival ?? new Date().toISOString().split('T')[0],
        departure: data?.departure ?? new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        propertyId: data?.propertyId ?? 'BER',
        unitGroupId: data?.unitGroupId ?? 'RT-001',
        ratePlanId: data?.ratePlanId ?? 'RP-001',
        adults: data?.adults ?? 1,
        primaryGuest: data?.primaryGuest ?? {
          firstName: 'John',
          lastName: 'Doe',
          email: 'guest@example.com',
        },
        totalGrossAmount: {
          amount: 150.00,
          currency: 'EUR',
        },
        createdAt: new Date().toISOString(),
      },
      success: true,
      message: 'Booking created successfully (mock)',
    };
  },

  getReservation: (reservationId) => ({
    success: true,
    data: {
      id: reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      reservationId: reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      status: 'confirmed',
      arrival: new Date().toISOString().split('T')[0],
      departure: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      propertyId: 'BER',
      totalGrossAmount: {
        amount: 150.00,
        currency: 'EUR',
      },
      primaryGuest: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'guest@example.com',
      },
    },
    message: 'Reservation retrieved successfully (mock)',
  }),

  // Lost card mock data
  validateLostCardGuest: (data) => ({
    success: true,
    data: {
      reservationId: data?.reservationNumber ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      reservationNumber: data?.reservationNumber ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      roomNumber: data?.roomNumber ?? data?.roomType ?? '101',
      lastName: data?.lastName ?? 'Doe',
      firstName: 'John',
      email: 'guest@example.com',
      phone: '+1234567890',
      guestName: `John ${data?.lastName ?? 'Doe'}`,
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      propertyId: 'BER',
    },
    message: 'Guest validated successfully (mock)',
  }),

  regenerateLostCard: (data) => ({
    success: true,
    data: {
      cardId: `CARD-${Date.now()}`,
      accessCode: `AC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: 'active',
      roomNumber: data?.roomNumber ?? '101',
      reservationId: data?.reservationId ?? API_CONFIG.DEFAULT_RESERVATION_ID,
      oldCardDeactivated: true,
      passcode: `AC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    },
    message: 'Card regenerated successfully (mock)',
  }),
};

// Utility functions for simulating delays
export const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const simulateHardwareDelay = (ms = 1500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock reservations data
export const mockReservations = [
  {
    reservationId: API_CONFIG.DEFAULT_RESERVATION_ID,
    id: API_CONFIG.DEFAULT_RESERVATION_ID,
    guest_name: { first_name: 'John', last_name: 'Doe' },
    firstName: 'John',
    lastName: 'Doe',
    guest_email: 'john.doe@example.com',
    guest_phone: '+1234567890',
    check_in_date: new Date().toISOString(),
    check_out_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    checkInDate: new Date().toISOString(),
    checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    room_number: '101',
    roomNumber: '101',
    status: 'confirmed',
    confirmation_code: 'CONF123',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    reservationId: 'RES-002',
    id: 'RES-002',
    guest_name: { first_name: 'Jane', last_name: 'Smith' },
    firstName: 'Jane',
    lastName: 'Smith',
    guest_email: 'jane.smith@example.com',
    guest_phone: '+1234567891',
    check_in_date: new Date(Date.now() + 86400000).toISOString(),
    check_out_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    checkInDate: new Date(Date.now() + 86400000).toISOString(),
    checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    room_number: '202',
    roomNumber: '202',
    status: 'confirmed',
    confirmation_code: 'CONF456',
    paymentStatus: 'completed',
    createdAt: new Date().toISOString(),
  },
];

// Mock success responses
export const mockSuccessResponses = {
  cardIssue: {
    success: true,
    data: {
      cardId: `CARD-${Date.now()}`,
      accessCode: `AC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: 'active',
    },
    message: 'Card issued successfully',
  },
  reservationCreate: {
    success: true,
    data: {
      id: `RES-${Date.now()}`,
      status: 'confirmed',
    },
    message: 'Reservation created successfully',
  },
};

// Mock errors
export const mockErrors = {
  notFound: {
    status: 404,
    message: 'Resource not found',
  },
  unauthorized: {
    status: 401,
    message: 'Unauthorized access',
  },
  serverError: {
    status: 500,
    message: 'Internal server error',
  },
};

// Helper to check if error is network-related (should use mock)
const isNetworkError = (error) => {
  return !error?.response || error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK';
};

// Helper to check if should use mock data
export const shouldUseMock = (error, useMock = true) => {
  const useMockEnv = String(process.env.REACT_APP_USE_MOCK ?? '').toLowerCase() === 'true';
  return useMock && (useMockEnv || isNetworkError(error));
};

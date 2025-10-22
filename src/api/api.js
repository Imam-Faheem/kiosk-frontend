import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchRooms = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/connections`);
    return response.data.map(conn => ({
      id: conn.room_id,
      name: conn.room_name,
      status: 'Available',
      lock_id: conn.lock_id,
      property: conn.property,
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [
      { id: '1', name: 'Room 101', status: 'Available', lock_id: 'LCK001', property: 'PROP001' },
      { id: '2', name: 'Room 102', status: 'Occupied', lock_id: 'LCK002', property: 'PROP001' },
      { id: '3', name: 'Room 103', status: 'Available', lock_id: 'LCK003', property: 'PROP001' },
    ];
  }
};

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/feedback`, {
      name: feedbackData.name || null,
      email: feedbackData.email || null,
      rating: feedbackData.rating,
      comments: feedbackData.comments,
      reservation_id: feedbackData.reservationId,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const submitForm = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/forms`, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth || null,
      address: formData.address,
      city: formData.city || null,
      zip: formData.zip || null,
      country: formData.country || null,
      guests: formData.guests,
      purpose_of_stay: formData.purpose_of_stay || null,
      consent: formData.consent ? 1 : 0,
      reservation_id: formData.reservation_id,
      property_id: formData.property_id,
      id_number: formData.id_number || null,
      signature: formData.signature,
    });
    if (response.status >= 200 && response.status < 300) {
      return response.data; // Return data only if successful
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    if (error.response) {
      // If the server returned an error response (e.g., 500), log details
      console.error('Server response:', error.response.data);
    }
    throw error; // Re-throw to be caught by the caller
  }
};

export const generatePasscode = async (reservationId, lockId, propertyId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/passcodes`, {
      reservation_id: reservationId,
      lock_id: lockId,
      property_id: propertyId,
      passcode: Math.floor(100000 + Math.random() * 900000).toString(),
    });
    return response.data;
  } catch (error) {
    console.error('Error generating passcode:', error);
    throw error;
  }
};

export const getConfirmationLink = async (reservationId, propertyId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/confirmation_links`, {
      reservation_id: reservationId,
      property_id: propertyId,
    });
    return response.data.link;
  } catch (error) {
    console.error('Error getting confirmation link:', error);
    throw error;
  }
};

export const getPaymentLink = async (reservationId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment_links`, {
      reservation_id: reservationId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    return response.data.payment_link;
  } catch (error) {
    console.error('Error getting payment link:', error);
    throw error;
  }
};
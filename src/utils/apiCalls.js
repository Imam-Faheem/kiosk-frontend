import api from "./api"; // Use configured Axios instance

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Refresh access token using refresh token
export const refreshAccessToken = async () => {
  try {
    const response = await api.post("/api/refresh_token");
    const newAccessToken = response.data.access_token;
    if (newAccessToken) {
      localStorage.setItem("access_token", newAccessToken);
      return newAccessToken;
    }
    return null;
  } catch (err) {
    console.error("Token refresh failed:", err);
    localStorage.removeItem("access_token");
    document.cookie = "ref_tok=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    return null;
  }
};

export const fetchRooms = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/connections`);
    return response.data.map(conn => ({
      id: conn.room_id,
      name: conn.room_name,
      status: 'Available',
      lock_id: conn.lock_id,
      property: conn.property,
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/feedback`, {
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
    const response = await api.post(`${API_BASE_URL}/forms`, {
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
    return response.data;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};

export const generatePasscode = async (reservationId, lockId, propertyId) => {
  try {
    const response = await api.post(`${API_BASE_URL}/passcodes`, {
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
    const response = await api.post(`${API_BASE_URL}/confirmation_links`, {
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
    const response = await api.post(`${API_BASE_URL}/payment_links`, {
      reservation_id: reservationId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    return response.data.payment_link;
  } catch (error) {
    console.error('Error getting payment link:', error);
    throw error;
  }
};
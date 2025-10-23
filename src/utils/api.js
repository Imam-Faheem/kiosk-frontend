import axios from "axios";

const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Configure Axios instance
const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // Include cookies for refresh token
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    if (config.url.includes("/refresh_token")) return config; // Skip for refresh
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh_token")
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          `${baseUrl}/api/refresh_token`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = response.data.access_token;
        if (newAccessToken) {
          localStorage.setItem("access_token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

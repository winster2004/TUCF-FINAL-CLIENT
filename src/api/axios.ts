import axios from "axios";

const API_BASE_URL = "http://localhost:3000";
const USE_CREDENTIALS = import.meta.env.VITE_API_USE_CREDENTIALS === "true";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Keep credentials opt-in so token-based auth doesn't get blocked by strict CORS.
  withCredentials: USE_CREDENTIALS,
});

// Auto-attach JWT token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;

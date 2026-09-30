import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Authorization Bearer token to all outgoing HTTP requests
api.interceptors.request.use(
  (config) => {
    const bearerToken = localStorage.getItem('shopez_token');
    if (bearerToken) {
      config.headers.Authorization = `Bearer ${bearerToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept global response failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clean invalid stored token
    if (error.response?.status === 401 && localStorage.getItem('shopez_token')) {
      // Don't auto-redirect on login attempt failure
      if (!error.config.url?.includes('/auth/login')) {
        localStorage.removeItem('shopez_token');
        localStorage.removeItem('shopez_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// src/services/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  async (config) => {
    // Determine if the endpoint requires authentication
    // List of endpoints that DO NOT require authentication
    const publicEndpoints = [
      '/v1/auth',         // Login
      '/v1/auth/refresh', // Refresh token
      '/v1/users',        // Register user (POST)
      '/v1/stores',       // List stores (GET) - assuming public based on previous notes
      '/v1/healthcheck',  // Healthcheck
    ];

    let isPublic = false;
    if (config.url && publicEndpoints.includes(config.url)) {
        isPublic = true;
        // For GET /v1/stores, it's public.
        // For POST /v1/users (registration), POST /v1/auth (login), POST /v1/auth/refresh (refresh) it's public.
        // For GET /v1/healthcheck, it's public.
    }


    if (!isPublic) {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No access token found for protected route:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentRefreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!currentRefreshToken) {
          console.log('No refresh token available, cannot refresh session.');
          await SecureStore.deleteItemAsync('accessToken'); // Clear potentially invalid token
          // Eventual navigation to login should be handled by UI layer based on state
          return Promise.reject(error);
        }

        console.log('Attempting to refresh token...');
        // Directly use axios.post for the refresh token request to avoid circular interceptor calls if 'api' instance is used
        const refreshResponse = await axios.post(`${API_BASE_URL}/v1/auth/refresh`, { refreshToken: currentRefreshToken }, {
          headers: { 'Content-Type': 'application/json' },
          baseURL: API_BASE_URL // Ensure baseURL is explicitly set if not using the 'api' instance
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        await SecureStore.setItemAsync('accessToken', newAccessToken);
        if (newRefreshToken) {
            await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        } else {
            await SecureStore.deleteItemAsync('refreshToken');
        }

        console.log('Token refreshed successfully. Retrying original request.');
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response ? refreshError.response.data : refreshError.message);
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');

        console.error('User session expired. Please log in again.');
        // Eventual navigation to login should be handled by UI layer
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// --- Authentication Endpoints ---
export const loginUser = (email, password) => {
  return api.post('/v1/auth', { email, password });
};

export const registerUser = (name, email, password) => {
  return api.post('/v1/users', { name, email, password });
};

export const refreshAuthToken = (refreshTokenValue) => {
  return api.post('/v1/auth/refresh', { refreshToken: refreshTokenValue });
};

// --- Stores Endpoints (example) ---
export const listStores = () => {
  return api.get('/v1/stores');
};
// export const getStore = (storeId) => api.get(`/v1/stores/${storeId}`); // If needed later

// --- Inventory Endpoints ---
export const getStoreInventory = (storeId) => {
  return api.get(`/v1/stores/${storeId}/inventory`);
};

export const getInventoryItemDetails = (storeId, itemId) => {
  return api.get(`/v1/stores/${storeId}/inventory/${itemId}`);
};

// Adjust inventory - will be used by AdjustInventoryScreen later
export const adjustInventory = (storeId, itemId, delta, reason) => {
  return api.patch(`/v1/stores/${storeId}/inventory/${itemId}`, { delta, reason });
};

// --- Items Endpoints ---
export const getItemDetails = (itemId) => {
  return api.get(`/v1/items/${itemId}`);
};

export const listItems = (params) => { // For catalog, etc.
    return api.get('/v1/items', { params }); // params: name, page, page_size, sort
};

export const createItem = (itemData) => { // For CreateItemScreen later
    return api.post('/v1/items', itemData);
};

// export default api; // Optional: export the instance directly if needed for advanced use cases.
// Individual function exports are preferred.

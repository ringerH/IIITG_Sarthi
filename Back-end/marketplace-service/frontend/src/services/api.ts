import axios from 'axios';
import { Listing, CreateListingData } from '../types/listing.types';

const AUTH_API_URL = 'http://localhost:5002/api/auth';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 1. Define a consistent key for localStorage
const TOKEN_KEY = 'authToken';

// 2. Create a function to get the token
const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// 3. Create the apiClient *without* the hardcoded token
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 4. Use an Axios interceptor to add the token to *every* request
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  getProfile: async () => {
    const token = getToken();
    if (!token) throw new Error("No token found");

    const response = await axios.get(`${AUTH_API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.user; // Assumes it returns { user: {...} }
  }
};

export const listingService = {
  // Get all listings
  getAllListings: async (): Promise<Listing[]> => {
    const response = await apiClient.get('/listings');
    return response.data.listings;
  },

  // Create new listing
  createListing: async (data: CreateListingData): Promise<Listing> => {
    const response = await apiClient.post('/listings', data);
    return response.data.listing;
  },

  // Get listing by ID
  getListingById: async (id: string): Promise<Listing> => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data.listing;
  },

  // Get user's listings
  getMyListings: async (): Promise<Listing[]> => {
    const response = await apiClient.get('/listings/my-listings');
    return response.data.listings;
  },

  updateListing: async (id: string, data: Partial<CreateListingData>): Promise<Listing> => {
    const response = await apiClient.put(`/listings/${id}`, data);
    return response.data.listing;
  },

  // --- ADD DELETE FUNCTION ---
  deleteListing: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
  }
};

export default apiClient;
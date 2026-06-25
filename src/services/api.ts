import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ;
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
// The session is intentionally kept alive until the user explicitly logs out:
// the access token never expires, so we do NOT auto-clear storage or redirect
// to login on a 401. Errors are passed through for the caller to handle.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);

export default api;

import axios from 'axios';
import { tokenManager } from '@/lib/auth/token';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://task-manager-app-n4fg.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with cross-origin requests
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  console.log('Adding token to request:', !!token);
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      console.log('Unauthorized response, removing token');
      // Clear token on unauthorized response
      tokenManager.removeToken();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const TASK_ENDPOINTS = {
  GET_ALL: '/tasks',
  CREATE: '/tasks',
  GET_BY_ID: (id: string) => `/tasks/${id}`,
  UPDATE: (id: string) => `/tasks/${id}`,
  DELETE: (id: string) => `/tasks/${id}`,
};
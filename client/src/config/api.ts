// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  PROFILE: `${API_BASE_URL}/profile`,
};

// Task endpoints
export const TASK_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/tasks`,
  CREATE: `${API_BASE_URL}/tasks`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/tasks/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/tasks/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/tasks/${id}`,
}; 
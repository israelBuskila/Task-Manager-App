import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return Promise.reject({
        message: error.response.data.error || 'An error occurred',
        status: error.response.status,
      });
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        message: 'No response from server',
        status: 0,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({
        message: error.message,
        status: 0,
      });
    }
  }
);
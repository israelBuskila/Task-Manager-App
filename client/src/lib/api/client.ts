import axios from 'axios';
import { ApiResponse, LoginCredentials, RegisterCredentials, Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
apiClient.interceptors.response.use(
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

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: any }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<{ token: string; user: any }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/auth/register', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Task API
export const taskApi = {
  getTasks: async (filters?: TaskFilters): Promise<ApiResponse<Task[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTask: async (id: string): Promise<ApiResponse<Task>> => {
    try {
      const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTask: async (task: CreateTaskInput): Promise<ApiResponse<Task>> => {
    try {
      const response = await apiClient.post<ApiResponse<Task>>('/tasks', task);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (task: UpdateTaskInput): Promise<ApiResponse<Task>> => {
    try {
      const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${task.id}`, task);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Admin API
export const adminApi = {
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/admin/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllTasks: async (filters?: TaskFilters): Promise<ApiResponse<Task[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Task[]>>('/admin/tasks', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient; 
import axios from 'axios';
import { ApiResponse, Task, TaskFilters } from '@/types';
import { api } from './index.api';

export const adminApi = {
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/admin/users');
      return response.data;
    } catch (error: any) {
      console.error('Error in getUsers API call:', error);
      return { success: false, error: error.message || 'Failed to fetch users' };
    }
  },

  getUsersWithTaskCount: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/admin/users/with-tasks');
      console.log('Raw API response:', response);
      
      // Ensure we have a properly formatted response
      if (response && response.data) {
        // If the API returns direct data array instead of { success, data } format
        if (Array.isArray(response.data)) {
          return { success: true, data: response.data };
        }
        return response.data;
      }
      
      return { success: false, error: 'Invalid response format' };
    } catch (error: any) {
      console.error('Error in getUsersWithTaskCount API call:', error);
      return { success: false, error: error.message || 'Failed to fetch users with task count' };
    }
  },

  getAllTasks: async (filters?: TaskFilters): Promise<ApiResponse<Task[]>> => {
    try {
      const response = await api.get<ApiResponse<Task[]>>('/admin/tasks', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error in getAllTasks API call:', error);
      return { success: false, error: error.message || 'Failed to fetch tasks' };
    }
  },
};

export default api; 
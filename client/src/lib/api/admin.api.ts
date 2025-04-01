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

  getAllTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    try {
      console.log('Fetching admin tasks with filters:', filters);
      const response = await api.get<Task[]>('/admin/tasks', { 
        params: { 
          ...filters,
          populate: 'assignedTo,user'
        } 
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      if (!Array.isArray(response.data)) {
        console.error('Invalid response data:', response.data);
        throw new Error('Invalid response format: expected array of tasks');
      }
      
      console.log('Admin tasks with populated user data:', 
        response.data.map(task => ({
          id: task.id || task._id,
          title: task.title,
          assignedTo: task.assignedTo,
          user: task.user
        }))
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error in getAllTasks API call:', error);
      // Don't wrap the error, let it propagate
      throw error;
    }
  },
};

export default api; 
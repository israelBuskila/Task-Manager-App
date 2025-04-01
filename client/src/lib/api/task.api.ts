import { TaskFilters, ApiResponse, Task, CreateTaskInput, UpdateTaskInput } from "@/types";
import { api } from "./index.api";

export const taskApi = {
    getTasks: async (filters?: TaskFilters): Promise<ApiResponse<Task[]>> => {
      try {
        const response = await api.get<ApiResponse<Task[]>>('/tasks', { params: filters });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

  
    getTask: async (id: string): Promise<ApiResponse<Task>> => {
      try {
        const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    createTask: async (task: CreateTaskInput): Promise<ApiResponse<Task>> => {
      try {
        const response = await api.post<ApiResponse<Task>>('/tasks', task);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    updateTask: async (task: UpdateTaskInput): Promise<ApiResponse<Task>> => {
      try {
        const response = await api.put<ApiResponse<Task>>(`/tasks/${task.id}`, task);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    deleteTask: async (id: string): Promise<ApiResponse<void>> => {
      try {
        const response = await api.delete<ApiResponse<void>>(`/tasks/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  };
  
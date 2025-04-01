import { LoginCredentials, ApiResponse, RegisterCredentials } from "@/types";
import { api } from "./index.api";

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: any }>> => {
      try {
        const response = await api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', credentials);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    register: async (credentials: RegisterCredentials): Promise<ApiResponse<{ token: string; user: any }>> => {
      try {
        const response = await api.post<ApiResponse<{ token: string; user: any }>>('/auth/register', credentials);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    logout: async (): Promise<ApiResponse<void>> => {
      try {
        const response = await api.post<ApiResponse<void>>('/auth/logout');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    getCurrentUser: async (): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get<ApiResponse<any>>('/auth/me');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  };
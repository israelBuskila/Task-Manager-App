import { LoginCredentials, ApiResponse, RegisterCredentials, User } from "@/types";
import { api } from "./index.api";

// Define the response type from the database
interface AuthResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
}

export const authApi = {
    login: async (credentials: LoginCredentials) => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            
            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            return response;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    },
  
    register: async (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> => {
      try {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
        return response.data;
      } catch (error) {
        console.error('Register API error:', error);
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
  
    getCurrentUser: async (): Promise<ApiResponse<AuthResponse>> => {
      try {
        const response = await api.get<ApiResponse<AuthResponse>>('/auth/me');
        return response.data;
      } catch (error) {
        console.error('Get current user API error:', error);
        throw error;
      }
    },
  };
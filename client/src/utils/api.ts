import { ApiResponse } from '@/types';

// Default request headers
const getDefaultHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    // Get token from local storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Generic API request function that wraps fetch
 */
export async function apiRequest<T>(
  url: string,
  method: string,
  data?: any,
  requireAuth: boolean = true
): Promise<ApiResponse<T>> {
  try {
    const options: RequestInit = {
      method,
      headers: getDefaultHeaders(requireAuth),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      // Handle expired tokens or unauthorized access
      if (response.status === 401) {
        // Clear token if it's expired or invalid
        localStorage.removeItem('token');
      }
      
      return {
        success: false,
        error: responseData.message || `Error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Helper methods for common HTTP methods
export const api = {
  get: <T>(url: string, requireAuth: boolean = true) => 
    apiRequest<T>(url, 'GET', undefined, requireAuth),
    
  post: <T>(url: string, data: any, requireAuth: boolean = true) => 
    apiRequest<T>(url, 'POST', data, requireAuth),
    
  put: <T>(url: string, data: any, requireAuth: boolean = true) => 
    apiRequest<T>(url, 'PUT', data, requireAuth),
    
  delete: <T>(url: string, requireAuth: boolean = true) => 
    apiRequest<T>(url, 'DELETE', undefined, requireAuth),
}; 
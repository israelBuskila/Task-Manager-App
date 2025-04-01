import { ApiResponse } from '@/types';

// Cache for ETag values to support conditional requests
const etagCache: Record<string, string> = {};

// Default request headers
const getDefaultHeaders = (url: string, includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add If-None-Match header for GET requests when we have a cached ETag
  if (etagCache[url]) {
    headers['If-None-Match'] = etagCache[url];
  }

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
      headers: getDefaultHeaders(url, requireAuth),
      // Only use cache for GET requests, disable for mutations
      cache: method === 'GET' ? 'default' : 'no-store',
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`API ${method} request to ${url}`);
    const response = await fetch(url, options);
    console.log(`API ${method} response from ${url}:`, response.status);
    
    // Store the ETag for future conditional requests (only for GET)
    if (method === 'GET') {
      const etag = response.headers.get('ETag');
      if (etag) {
        etagCache[url] = etag;
      }
    }

    // Handle 304 Not Modified as a success with cached data
    if (response.status === 304) {
      console.log(`304 Not Modified for ${url} - using cached data`);
      return {
        success: true,
        data: null as any, // Client should use cached data
        cached: true
      };
    }

    // For other responses, parse the JSON
    const responseData = await response.json();
    console.log(`API ${method} response data:`, responseData);

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
    console.error(`API ${method} request to ${url} failed:`, error);
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
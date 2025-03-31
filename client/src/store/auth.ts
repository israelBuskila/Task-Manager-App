import { atom } from 'jotai';
import { User, LoginCredentials, RegisterCredentials } from '@/types';
import { api } from '@/utils/api';
import { AUTH_ENDPOINTS } from '@/config/api';
import { setCookie, deleteCookie } from 'cookies-next';

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);

// Derived atoms for auth actions
export const loginAtom = atom(
  null,
  async (get, set, credentials: LoginCredentials) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      const response = await api.post<User & { token: string }>(
        AUTH_ENDPOINTS.LOGIN,
        credentials,
        false
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }
      
      const userData = response.data;
      
      // Store token in localStorage for API requests
      localStorage.setItem('token', userData.token);
      
      // Also set a cookie for middleware access
      setCookie('token', userData.token, { 
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      console.log('Login successful:', userData);
      
      // Remove token from user object before storing
      const { token, ...userWithoutToken } = userData;
      set(userAtom, userWithoutToken);
      
      return userData;
    } catch (error) {
      set(errorAtom, error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

export const registerAtom = atom(
  null,
  async (get, set, credentials: RegisterCredentials) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      const response = await api.post<{ token: string; user: User }>(
        AUTH_ENDPOINTS.REGISTER,
        credentials,
        false
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Registration failed');
      }
      
      // Store token in localStorage for API requests
      localStorage.setItem('token', response.data.token);
      
      // Also set a cookie for middleware access
      setCookie('token', response.data.token, { 
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      
      set(userAtom, response.data.user);
    } catch (error) {
      set(errorAtom, error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// Load user from token (called on app initialization)
export const loadUserAtom = atom(
  null,
  async (get, set) => {
    try {
      // Skip if no token exists
      if (typeof window === 'undefined' || !localStorage.getItem('token')) {
        return;
      }
      
      set(isLoadingAtom, true);
      
      const response = await api.get<User>(AUTH_ENDPOINTS.PROFILE);
      
      if (!response.success || !response.data) {
        // Clear invalid token
        localStorage.removeItem('token');
        deleteCookie('token');
        return;
      }
      
      set(userAtom, response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      deleteCookie('token');
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

export const logoutAtom = atom(
  null,
  async (get, set) => {
    localStorage.removeItem('token');
    deleteCookie('token');
    set(userAtom, null);
  }
); 
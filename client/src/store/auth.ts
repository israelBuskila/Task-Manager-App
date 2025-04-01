import { atom } from 'jotai';
import { User, LoginCredentials, RegisterCredentials } from '@/types';
import { authApi } from '@/lib/api/auth.api';
import { tokenManager } from '@/lib/auth/token';
import { NotificationManager } from '@/lib/notification/notifications';

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);

// Helper function to map database user to frontend user type
const mapDbUserToUser = (dbUser: any): User => ({
  id: dbUser._id,
  firstName: dbUser.firstName,
  lastName: dbUser.lastName,
  email: dbUser.email,
  role: dbUser.role
});

// Derived atoms for auth actions
export const loginAtom = atom(
  null,
  async (get, set, credentials: LoginCredentials) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
      
      const response = await authApi.login(credentials);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const { token, ...userData } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store token using token manager
      tokenManager.setToken(token);

      const user = mapDbUserToUser(userData);
      
      // Store user data without token
      set(userAtom, user);
      
      // Force a state update
      set(isLoadingAtom, false);
      
      // Return the mapped user data
      return user;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set(errorAtom, errorMessage);
      NotificationManager.showError(errorMessage);
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
      
      const response = await authApi.register(credentials);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Registration failed');
      }
      
      const { token, ...userData } = response.data;
      
      // Store token using token manager
      tokenManager.setToken(token);
      
      set(userAtom, mapDbUserToUser(userData));
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
      if (!tokenManager.hasToken()) {
        console.log('No token found, skipping user load');
        return;
      }
      
      set(isLoadingAtom, true);
      console.log('Loading user data...');
      
      const response = await authApi.getCurrentUser();
      console.log('Current user response:', response);
      
      if (!response.data) {
        console.log('No user data received, clearing token');
        tokenManager.removeToken();
        return;
      }
      
      const { token, ...userData } = response.data;
      const user = mapDbUserToUser(userData);
      console.log('Setting user data:', user);
      set(userAtom, user);
    } catch (error) {
      console.error('Failed to load user:', error);
      tokenManager.removeToken();
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

export const logoutAtom = atom(
  null,
  async (get, set) => {
    tokenManager.removeToken();
    set(userAtom, null);
  }
); 
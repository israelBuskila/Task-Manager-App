import { setCookie, deleteCookie, getCookie } from 'cookies-next';

const TOKEN_KEY = 'token';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

export const tokenManager = {
  /**
   * Store the authentication token
   * @param token - The JWT token to store
   */
  setToken: (token: string) => {
    try {
      // Store in cookie with proper settings
      setCookie(TOKEN_KEY, token, {
        maxAge: TOKEN_EXPIRY,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      console.log('Token stored successfully in cookie');
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  },

  /**
   * Get the authentication token
   * @returns The stored token or null if not found
   */
  getToken: (): string | null => {
    try {
      const token = getCookie(TOKEN_KEY);
      return token ? token.toString() : null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Remove the authentication token
   */
  removeToken: () => {
    try {
      deleteCookie(TOKEN_KEY, {
        path: '/'
      });
      console.log('Token removed from cookie');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  /**
   * Check if a token exists
   * @returns boolean indicating if a token exists
   */
  hasToken: (): boolean => {
    try {
      const token = getCookie(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }
}; 
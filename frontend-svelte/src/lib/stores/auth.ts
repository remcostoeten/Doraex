import { writable, get } from 'svelte/store';
import type { TAuthState, TAuthUser, TAuthTokens, TLoginCredentials, TRegisterData, TPasswordReset, TPasswordResetConfirm } from '../types';

function createAuthStore() {
  const initialState: TAuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  };

  const { subscribe, set, update } = writable<TAuthState>(initialState);

  const API_BASE_URL = 'http://localhost:3002/api/auth';

  function setLoading(loading: boolean) {
    update(state => ({ ...state, isLoading: loading, error: null }));
  }

  function setError(error: string) {
    update(state => ({ ...state, error, isLoading: false }));
  }

  function setAuthenticated(user: TAuthUser, tokens: TAuthTokens) {
    update(state => ({
      ...state,
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
      error: null
    }));
    
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  function clearAuth() {
    set({ ...initialState, isLoading: false });
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  }

  async function login(credentials: TLoginCredentials) {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setAuthenticated(data.user, data.tokens);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function register(userData: TRegisterData) {
    setLoading(true);
    
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return { success: false, error: 'Passwords do not match' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setAuthenticated(data.user, data.tokens);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function logout() {
    let currentState: TAuthState;
    const unsubscribe = subscribe(state => currentState = state);
    unsubscribe();
    
    if (currentState.tokens?.access_token) {
      try {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentState.tokens.access_token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }
    
    clearAuth();
  }

  async function refreshToken() {
    let currentState: TAuthState;
    const unsubscribe = subscribe(state => currentState = state);
    unsubscribe();
    
    if (!currentState.tokens?.refresh_token) {
      clearAuth();
      return { success: false, error: 'No refresh token available' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: currentState.tokens.refresh_token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      setAuthenticated(currentState.user!, data.tokens);
      return { success: true };
    } catch (error) {
      clearAuth();
      return { success: false, error: error instanceof Error ? error.message : 'Token refresh failed' };
    }
  }

  async function resetPassword(resetData: TPasswordReset) {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resetData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }

      update(state => ({ ...state, isLoading: false, error: null }));
      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function confirmResetPassword(resetData: TPasswordResetConfirm) {
    setLoading(true);
    
    if (resetData.password !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return { success: false, error: 'Passwords do not match' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: resetData.token,
          password: resetData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset confirmation failed');
      }

      update(state => ({ ...state, isLoading: false, error: null }));
      return { success: true, message: data.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset confirmation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function initialize() {
    setLoading(true);
    
    const storedTokens = localStorage.getItem('auth_tokens');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedTokens && storedUser) {
      try {
        const tokens: TAuthTokens = JSON.parse(storedTokens);
        const user: TAuthUser = JSON.parse(storedUser);
        
        const tokenExpirationTime = new Date().getTime() + (tokens.expires_in * 1000);
        if (tokenExpirationTime > Date.now()) {
          setAuthenticated(user, tokens);
        } else {
          await refreshToken();
        }
      } catch (error) {
        console.error('Failed to initialize auth from localStorage:', error);
        clearAuth();
      }
    } else {
      setLoading(false);
    }
  }

  return {
    subscribe,
    login,
    register,
    logout,
    refreshToken,
    resetPassword,
    confirmResetPassword,
    initialize,
    clearError: () => update(state => ({ ...state, error: null }))
  };
}

export const authStore = createAuthStore();

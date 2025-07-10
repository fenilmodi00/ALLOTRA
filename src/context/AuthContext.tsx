import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import api from '../services/api';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignout: boolean;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string; user: User }
  | { type: 'SIGN_IN'; token: string; user: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_LOADING'; isLoading: boolean };

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isLoading: true,
  isSignout: false,
  token: null,
  user: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.token,
        user: action.user,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        token: action.token,
        user: action.user,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        token: null,
        user: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      let user: User | null = null;

      try {
        token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          user = JSON.parse(userStr);
        }

        if (token && user) {
          // Set the token in the API client
          api.setToken(token);
        }
      } catch (e) {
        // Restoring token failed
        console.error('Failed to restore auth state:', e);
      }

      // Validate token on the server
      if (token && user) {
        try {
          await api.get('/auth/validate');
          dispatch({ type: 'RESTORE_TOKEN', token, user });
        } catch (error) {
          console.error('Token validation failed:', error);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          dispatch({ type: 'SIGN_OUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    state,
    dispatch,
    signIn: async (email: string, password: string) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      try {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        
        // Store the token and user data
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        // Set the token in the API client
        api.setToken(token);
        
        dispatch({ type: 'SIGN_IN', token, user });
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }
    },
    signUp: async (name: string, email: string, password: string) => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      try {
        const response = await api.post('/auth/register', { name, email, password });
        const { token, user } = response.data;
        
        // Store the token and user data
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        // Set the token in the API client
        api.setToken(token);
        
        dispatch({ type: 'SIGN_IN', token, user });
      } catch (error) {
        console.error('Sign up error:', error);
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }
    },
    signOut: async () => {
      dispatch({ type: 'SET_LOADING', isLoading: true });
      try {
        // Remove token from storage
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        
        // Clear the token in the API client
        api.clearToken();
        
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        console.error('Sign out error:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }
    },
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
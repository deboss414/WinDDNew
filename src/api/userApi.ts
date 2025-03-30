import { User } from '../types/user';
import apiClient from '../utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user for testing
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
};

// Mock token for testing
const mockToken = 'mock-jwt-token-12345';

interface UserResponse {
  user: User;
}

interface UsersResponse {
  users: User[];
}

interface AuthResponse {
  user: User;
  token: string;
}

export const userApi = {
  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/users/me');
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Get user by ID
  getUser: async (userId: string): Promise<UserResponse> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get all users
  getUsers: async (): Promise<UsersResponse> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<UserResponse> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For testing, accept any email/password combination
      const response = {
        data: {
          user: mockUser,
          token: mockToken
        }
      };
      
      await AsyncStorage.setItem('token', mockToken);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Register with email and password
  register: async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName }),
      });
      if (!response.ok) {
        throw new Error('Failed to register');
      }
      return await response.json();
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (password: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },
};

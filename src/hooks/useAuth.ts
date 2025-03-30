import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await userApi.login(email, password);
      context.setUser(response.user);
      context.setToken(response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ) => {
    try {
      const displayName = `${firstName} ${lastName}`;
      const response = await userApi.register(email, password, displayName);
      context.setUser(response.user);
      context.setToken(response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    user: context.user,
    token: context.token,
    isAuthenticated: !!context.user,
    login: handleLogin,
    signup: handleSignup,
    logout: context.logout,
  };
}; 
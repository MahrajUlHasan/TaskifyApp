import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { AuthContextType, User, RegisterRequest } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const [currentUser, authToken] = await Promise.all([
        authService.getCurrentUser(),
        authService.getAuthToken(),
      ]);

      if (currentUser && authToken) {
        setUser(currentUser);
        setToken(authToken);
      }
    } catch (error) {
      console.error('Auth state check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting login for username:', username);
      const authResponse = await authService.login({ username, password });
      console.log('AuthContext: Login successful, user:', authResponse.user);
      setUser(authResponse.user);
      setToken(authResponse.token);
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await authService.adminLogin({ username, password });
      
      if (authResponse.user.role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      setUser(authResponse.user);
      setToken(authResponse.token);
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting registration for username:', data.username);
      const authResponse = await authService.register(data);
      console.log('AuthContext: Registration successful, user:', authResponse.user);
      setUser(authResponse.user);
      setToken(authResponse.token);
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting logout');
      await authService.logout();
      setUser(null);
      setToken(null);
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    adminLogin,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

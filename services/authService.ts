import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  ApiResponse 
} from '../types';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        await this.storeAuthData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Admin login
  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.ADMIN_LOGIN,
        credentials
      );

      if (response.success && response.data) {
        await this.storeAuthData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Admin login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Admin login failed');
    }
  }

  // Register user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.REGISTER,
        userData
      );

      if (response.success && response.data) {
        await this.storeAuthData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      await apiClient.clearAuthToken();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get current user from storage
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get auth token from storage
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Get auth token error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const user = await this.getCurrentUser();
      return !!(token && user);
    } catch (error) {
      console.error('Is authenticated error:', error);
      return false;
    }
  }

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user?.role === 'ADMIN';
    } catch (error) {
      console.error('Is admin error:', error);
      return false;
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        API_ENDPOINTS.USER_PROFILE,
        userData
      );

      if (response.success && response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        return response.data;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Store authentication data
  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, authData.token],
        [STORAGE_KEYS.USER, JSON.stringify(authData.user)],
      ]);
      await apiClient.setAuthToken(authData.token);
    } catch (error) {
      console.error('Store auth data error:', error);
      throw new Error('Failed to store authentication data');
    }
  }
}

export const authService = new AuthService();

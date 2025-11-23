import AsyncStorage from '@react-native-async-storage/async-storage';
import { localStorageService } from './localStorageService';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User
} from '../types';

// Storage keys for auth data (separate from local storage service keys)
const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
};

class AuthService {
  // Initialize storage on first use
  private async ensureInitialized(): Promise<void> {
    await localStorageService.initializeStorage();
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      await this.ensureInitialized();
      const result = await localStorageService.login(credentials);
      await this.storeAuthData({ token: result.token, user: result.user });
      return { token: result.token, user: result.user };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Admin login
  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      await this.ensureInitialized();
      const result = await localStorageService.adminLogin(credentials);
      await this.storeAuthData({ token: result.token, user: result.user });
      return { token: result.token, user: result.user };
    } catch (error: any) {
      throw new Error(error.message || 'Admin login failed');
    }
  }

  // Register user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      await this.ensureInitialized();
      const result = await localStorageService.register(userData);
      await this.storeAuthData({ token: result.token, user: result.user });
      return { token: result.token, user: result.user };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await localStorageService.logout();
      await AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.TOKEN,
        AUTH_STORAGE_KEYS.USER,
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get current user from storage
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get auth token from storage
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
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
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const updatedUser = await localStorageService.updateProfile(currentUser.id, userData);
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Store authentication data
  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [AUTH_STORAGE_KEYS.TOKEN, authData.token],
        [AUTH_STORAGE_KEYS.USER, JSON.stringify(authData.user)],
      ]);
    } catch (error) {
      console.error('Store auth data error:', error);
      throw new Error('Failed to store authentication data');
    }
  }
}

export const authService = new AuthService();

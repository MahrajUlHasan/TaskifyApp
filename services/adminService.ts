import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { User, ApiResponse, PaginatedResponse } from '../types';

interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  activeUsers: number;
  completedTasks: number;
  pendingTasks: number;
}

class AdminService {
  // Get all users (admin only)
  async getAllUsers(page: number = 0, size: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
        `${API_ENDPOINTS.ADMIN_USERS}?page=${page}&size=${size}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }

  // Get admin statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await apiClient.get<ApiResponse<AdminStats>>(
        API_ENDPOINTS.ADMIN_STATS
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch admin statistics');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch admin statistics');
    }
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `${API_ENDPOINTS.ADMIN_USERS}/${userId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
    try {
      const response = await apiClient.patch<ApiResponse<User>>(
        `${API_ENDPOINTS.ADMIN_USERS}/${userId}/role`,
        { role }
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update user role');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user role');
    }
  }

  // Search users (admin only)
  async searchUsers(query: string, page: number = 0, size: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
        `${API_ENDPOINTS.ADMIN_USERS}/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to search users');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search users');
    }
  }
}

export const adminService = new AdminService();
